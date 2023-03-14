import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { StaffModule } from './staff/staff.module'

import { dataSourceOptions } from './database/data-source'
import {AuthModule} from "./auth/auth.module";


@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(dataSourceOptions),
		AuthModule,
		StaffModule,
	],
	controllers: [AppController],
	providers: [AppService],
	exports: [],
})
export class AppModule {}
