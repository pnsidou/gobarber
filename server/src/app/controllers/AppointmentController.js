import * as Yup from 'yup';
import { startOfHour, subHours, isBefore, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const itemPerPage = 2;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        cancelled_at: null,
      },
      order: ['date'],
      limit: itemPerPage,
      offset: (page - 1) * itemPerPage,
      attributes: ['id', 'date'],
      //*
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      //*/
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    const CheckIsProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!CheckIsProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /*
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /*
     * Check date availability
     */
    const existsConflictingAppointments = await Appointment.findOne({
      where: {
        provider_id,
        cancelled_at: null,
        date: hourStart,
      },
    });

    if (existsConflictingAppointments) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /*
     * Notify provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(hourStart, "dd' de 'MMMM', às 'H:mm'h'", {
      locale: pt,
    });

    console.log(user);

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}.`,
      user: user.id,
    }).catch(err => console.log(err));

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.json(400).json({ error: 'Appointment does not exist' });
    }

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Not authorized to delete this appointment',
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'Appointments must be cancelled with at least 2 hours in advance.',
      });
    }

    appointment.cancelled_at = new Date();

    appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
