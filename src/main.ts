import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //helmet middleWare
  app.use(helmet())

  //cors
  app.enableCors({ origin: 'http://localhost:3001' });

  /**
   * swagger configration
   */
  if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('NestJS App Course API')
    .setVersion('1.0')
    .addSecurity('bearer',{type: 'http', scheme:'bearer'})
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // http://localhost:5000/swagger
  SwaggerModule.setup('swagger', app, document);
}

  app.useGlobalPipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted: true}))
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
