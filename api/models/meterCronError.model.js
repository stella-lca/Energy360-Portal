"use strict";

module.exports = (sequelize, DataTypes) => {

    let MeterCronError = sequelize.define("GCEP_MeterCronError", {
        errorMessage: {
            type: DataTypes.STRING,
            field: "errorMessage"
        },
        tokenId: {
            type: DataTypes.INTEGER(),
            field: "tokenId",
            references: {
                model: 'GCEP_Tokens',
                key: 'id'
            }
        },
        minDate: {
            type: DataTypes.STRING,
            field: "minDate"
        },
        maxDate: {
            type: DataTypes.STRING,
            field: "maxDate"
        }
    },
        {
            timestamps: true,
            createdAt: "createdDate",
            updatedAt: "modifiedDate"
        });

    return MeterCronError;
};