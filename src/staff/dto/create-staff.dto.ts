import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Length,
} from 'class-validator'

import { StaffTypeNames } from '../staff.entity'

export class CreateStaffMemberDto {
	@ApiProperty({
		required: true,
		example: 'example@gmail.com',
		description: 'Email address',
		nullable: false,
	})
	@IsString({ message: 'Must be a string' })
	@IsEmail({}, { message: 'Uncorrected email' })
	email: string

	@ApiProperty({
		required: true,
		example: 'Dmitriy',
		description: 'Name',
		nullable: false,
	})
	@IsString({ message: 'Must be a string' })
	@Length(4, 15, { message: 'Must be at least 4 and more than 16' })
	name: string

	@ApiProperty({
		required: false,
		example: '12345678',
		description: 'Password',
		nullable: false,
	})
	@IsString({ message: 'Must be a string' })
	@Length(4, 25, { message: 'Must be at least 4 and more than 16' })
	password: string

	@ApiProperty({
		required: false,
		example: 1000,
		description: 'Base Staff Member Salary',
		nullable: false,
	})
	@IsNumber({ allowInfinity: false, allowNaN: false })
	baseSalary: number

	@ApiProperty({
		required: false,
		example: 'employee',
		description: 'Staff Type Name',
		nullable: true,
		enum: StaffTypeNames,
	})
	@IsOptional()
	@IsString({ message: 'Must be a string with a name of staffType' })
	@IsEnum(StaffTypeNames)
	@Length(2, 15, { message: 'Must be at least 4 and more than 16' })
	staffTypeName: string
}
