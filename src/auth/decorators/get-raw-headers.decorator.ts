import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const getRawHeaders = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const headers = req.rawHeaders;
    return headers;
});