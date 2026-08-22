import app from "../src/app";
import { connectDatabase } from "../src/config/database";
import { AttendanceService } from "../src/services/attendance.service";
import { PayrollService } from "../src/services/payroll.service";

let databaseReady: Promise<unknown> | undefined;

const prepareDatabase = () => {
  if (!databaseReady) {
    databaseReady = connectDatabase().then(async () => {
      await AttendanceService.setup();
      await PayrollService.setup();
    });
  }
  return databaseReady;
};

export default async function handler(req: any, res: any) {
  await prepareDatabase();
  return app(req, res);
}
