import { Sequelize } from "sequelize";
import { DB_NAME } from "../constant.js";

const sequelize = new Sequelize(
  `${process.env.DB_URI}/${DB_NAME}`,
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(
      `Connection Established Successfully to DB`,
    );
  } catch (error) {
    console.error('Connection to DB failed', error);
    process.exit(1);
  }
};
export default connectDB;
export {sequelize}
