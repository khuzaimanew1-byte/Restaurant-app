---
name: NestJS + esbuild DI fix
description: esbuild does not support emitDecoratorMetadata — NestJS constructor injection requires explicit @Inject() tokens
---

esbuild explicitly does NOT support TypeScript's `emitDecoratorMetadata`. Without it, NestJS cannot resolve constructor parameter types and injected services come through as `undefined`.

**Rule:** Every constructor parameter in a NestJS provider or controller must use `@Inject(Token)` explicitly when the build tool is esbuild.

**How to apply:**
- Controller: `constructor(@Inject(AuthService) private readonly auth: AuthService) {}`
- Service: `constructor(@Inject(EmailService) private readonly email: EmailService) {}`
- Import `Inject` from `@nestjs/common` alongside `Injectable`

**Why:** esbuild docs state: "esbuild does not support the emitDecoratorMetadata TypeScript setting." NestJS reads `Reflect.getMetadata("design:paramtypes", ...)` which is only populated by tsc with `emitDecoratorMetadata: true`. With esbuild, that metadata is always empty — so NestJS can't figure out what to inject without explicit tokens.

**Health controller works fine** because it has no injected dependencies (stateless).
