"use strict";

module.exports = (sequelize, DataTypes) => {

    let EnvModel = sequelize.define("GCEP_Env", {
        SlackHook: {
            type: DataTypes.STRING,
            field: "SlackHook"
        }
    },
        {
            timestamps: true,
            createdAt: "createdDate",
            updatedAt: "modifiedDate"
        });

    return EnvModel;
};