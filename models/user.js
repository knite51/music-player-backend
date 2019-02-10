import bcrypt from 'bcrypt';

const UserModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'Users',
    {
      id: {
        type: DataTypes.STRING.BINARY,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV1
      },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCreate(user) {
          user.hashPassword();
        }
      }
    }
  );

  // Instance methods
  User.prototype.hashPassword = function hashPassword() {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(9));
    return this.password;
  };

  return User;
};

export default UserModel;
