// import rollbar from '../src/services/rollbar';

const winston = require('winston');

// require('winston-daily-rotate-file');
//
// const transport = new (winston.transports.DailyRotateFile)({
//     filename: process.env.NODE_ENV === 'DEVELOP'?`../rest-server-logs/rest-dev-%DATE%.log`:`../rest-server-logs/rest-prod-%DATE%.log`,
//     datePattern: 'DD-MM-YYYY',
//     zippedArchive: true,
//     maxSize: '40m',
//     maxFiles: '30d',
// });

// timezone function winston calls to get timezone(ASIA/KOLKATA)

const timezoned = () => new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
});


// options for logger object -- recent file
const options = {
    // file: {
    //     level: 'info',
    //     filename: process.env.NODE_ENV === 'DEVELOP'?`../rest-server-logs/rest-dev-recent.log`:`../rest-server-logs/rest-prod-recent.log`,
    //     handleExceptions: true,
    //     json: true,
    //     maxsize: 5242880, // 5MB
    //     maxFiles: 1,
    // },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        //colorize: true,
    },
};

const transports = {
    console: new winston.transports.Console(options.console),
    //file: new winston.transports.File(options.file)
  };

// logger object with above defined options
export const logger = winston.createLogger({
    transports: [
        //transports.file,
        transports.console,
        //transport,
    ],
    format:
        winston.format.combine(winston.format.simple(),
            winston.format.timestamp({
                format: timezoned,
            }),
            winston.format.printf((info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)),
    exitOnError: false,
});

// writing file
logger.stream = {
    write: function(message){
        logger.info(message.substring(0,message.lastIndexOf('\n')));
    }
};


export const updateLevel = (req, res, next) =>{
    try{
        const newLevel = req.body.level
        transports.file.level = newLevel
        res.sendStatus(200);
        logger.info(`logger level updated to ${newLevel}`)
    } catch(e){
        logger.error('failed to update logger level')
        next(e);
    }
}

// rollbar.log('Hello World, rollbar logging error logs')