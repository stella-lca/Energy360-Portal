"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "GCEP_Users",
    {
      firstName: {
        type: DataTypes.STRING,
        field: "firstName"
      },
      lastName: {
        type: DataTypes.STRING,
        field: "lastName"
      },
      streetAddress1: {
        type: DataTypes.STRING,
        field: "streetAddress1"
      },
      streetAddress2: {
        type: DataTypes.STRING,
        field: "streetAddress2"
      },
      city: {
        type: DataTypes.STRING,
        field: "city"
      },
      zipCode: {
        type: DataTypes.INTEGER,
        field: "zipCode"
      },
      state: {
        type: DataTypes.STRING,
        field: "state"
      },
      country: {
        type: DataTypes.STRING,
        field: "country"
      },
      phone: {
        type: DataTypes.STRING,
        field: "phone"
      },
      email: {
        type: DataTypes.STRING,
        field: "email"
      },
      password: {
        type: DataTypes.STRING,
        field: "password"
      },
      accountTypeDetail: {
        type: DataTypes.STRING,
        field: "accountTypeDetail"
      }
    }
  );

  return User;
};
