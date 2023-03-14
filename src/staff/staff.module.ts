import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StaffController } from './staff.controller'
import { StaffService } from './staff.service'
import {Staff, StaffType} from "./staff.entity";


@Module({
	imports: [TypeOrmModule.forFeature([Staff, StaffType])],
	controllers: [StaffController],
	providers: [StaffService],
	exports: [StaffService],
})
export class StaffModule {}
