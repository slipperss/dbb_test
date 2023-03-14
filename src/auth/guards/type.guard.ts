import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common'

const TypeGuard = (types: string[]): Type<CanActivate> => {
	class TypeGuardMixin implements CanActivate {
		canActivate(context: ExecutionContext) {
			const req = context.switchToHttp().getRequest()
			return types.includes(req.user.type.name)
		}
	}

	return mixin(TypeGuardMixin)
}

export default TypeGuard
