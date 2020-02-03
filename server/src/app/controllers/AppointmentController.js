import * as Yup from 'yup'
import { startOfHour, isBefore, parseISO } from 'date-fns'
import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query
    const itemPerPage = 2

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        cancelled_at: null
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
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
      //*/
    })

    return res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.string().required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { provider_id, date } = req.body

    const CheckIsProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true
      }
    })

    if (!CheckIsProvider) {
      return res.status(401).json({ error: 'You can only create appointments with providers' })
    }

    /*
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date))

    console.log(hourStart, '\n\n\n')
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' })
    }

    /*
     * Check date availability
     */
    console.log(hourStart)
    const existsConflictingAppointments = await Appointment.findOne({
      where: {
        provider_id,
        cancelled_at: null,
        date: hourStart
      }
    })

    if (existsConflictingAppointments) {
      return res.status(400).json({ error: 'Appointment date is not available' })
    }
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    })

    return res.json(appointment)
  }
}

export default new AppointmentController()