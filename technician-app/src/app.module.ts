import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianModule } from './technician/technician.module';
import { ServiceDetailsModule } from './service-details/service-details.module';
import { ConfigModule } from '@nestjs/config';
import { TwilioModule } from './twilio/twilio.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';

// Function to get writable database path
function getDatabasePath(): string {
  // Try to use environment variable first
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  // Fallback to user home directory
  const userDataDir = join(homedir(), 'AppData', 'Roaming', 'technicianapp', 'database');
  
  // Ensure directory exists
  if (!existsSync(userDataDir)) {
    mkdirSync(userDataDir, { recursive: true });
  }
  
  return join(userDataDir, 'app.db');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
    type: 'sqlite',
    database: getDatabasePath(),//'service.db', //!changed from service.db
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production', // Turn off in production!
    migrationsRun: true, // ✅ Auto-run migrations
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    autoLoadEntities: true,
  }),
    TechnicianModule,
    ServiceDetailsModule,
    TwilioModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
