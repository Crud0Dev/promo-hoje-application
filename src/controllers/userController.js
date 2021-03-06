import * as Yup from 'yup';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const User = mongoose.model('User');

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: ' Validation fails'
      });
    }
    const {
      email,
      password
    } = req.body;
    const userExists = await User.findOne({
      email
    });
    if (userExists) {
      return res.status(400).json({
        error: 'User already exists'
      });
    }
    req.body.password = await bcrypt.hash(password, 8);
    const user = await User.create(req.body);
    return res.json(user);
  }

  // ///////////////////////////////////////////////////////////////////////
  async update(req, res) {
    const data = req.body
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    if (!(await schema.isValid(data))) {
      return res.status(500).json({
        error: ' Validation fails'
      });
    }
    const {
      email
    } = data;

    const checkEmailUser = await User.findOne({
      "email": email
    }).exec();
    checkEmailUser.password = data.password;
    console.log("------------>", checkEmailUser.password)
    checkEmailUser.password = await bcrypt.hash(checkEmailUser.password, 8)

    checkEmailUser.updatedAt = Date.now()
    checkEmailUser.lastLogin = Date.now()

    await checkEmailUser.save();


    await checkEmailUser.save()

    return res.json({
      alterado: true,
      "email": email
    });
  }

  async find(req, res) {
    const users = await User.find();
    return res.json({
      users
    });


  }
}

export default new UserController();
