module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users',{
        email: {
            type: DataTypes.STRING,
            notEmpty: true,
            allowNull: false,
        },
        keycloakId:{
            type:DataTypes.STRING,
            notEmpty: true,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            notEmpty: false,
            allowNull: true
        },
        role:{
            type:DataTypes.STRING,
            notEmpty: true,
            allowNull: false
        },
        status:{
            type:DataTypes.STRING,
            notEmpty:true,
            allowNull:false
        }
    })
    return Users;
}