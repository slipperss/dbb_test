import {ApiProperty} from "@nestjs/swagger";

import {IsNumber} from "class-validator";


export class AddSupervisorDto {

    @ApiProperty({
		required: true,
		example: 1,
		description: 'Supervisor Id',
		nullable: false,
	})
	@IsNumber({ allowInfinity: false, allowNaN: false })
    supervisorId: number
}
