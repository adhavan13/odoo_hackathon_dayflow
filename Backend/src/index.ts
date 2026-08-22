import app from "./app";
import { config } from "./config/env.config";
import { connectDatabase } from "./config/database";
import { AttendanceService } from "./services/attendance.service";
import { PayrollService } from "./services/payroll.service";

const startServer = async () => {
  await connectDatabase();
  await AttendanceService.setup();
  await PayrollService.setup();
  const server = app.listen(config.port, () => {
    console.log(
      `Server running on port ${config.port} in ${config.nodeEnv} mode`,
    );
  });
  return server;
};

export default startServer();
