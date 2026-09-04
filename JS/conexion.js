const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'jhonny',
    password: 'Utilizar',
    database: 'calculadora'
});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:');
        console.log(error.message);
        return;
    }

    console.log('Conexion exitosa con MySQL');
    console.log('Base de datos: calculadora');
});

module.exports = conexion;