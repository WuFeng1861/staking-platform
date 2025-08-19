import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { ExchangeService } from '../services/exchange.service';
import { CreateExchangeRateDto } from '../dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from '../dto/update-exchange-rate.dto';

@Controller('exchange')
@UsePipes(new ValidationPipe({ transform: true }))
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  /**
   * 创建兑换比例
   */
  @Post('rate')
  async createExchangeRate(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return await this.exchangeService.createExchangeRate(createExchangeRateDto);
  }

  /**
   * 获取所有兑换比例
   */
  @Get('rates')
  async getAllExchangeRates() {
    return await this.exchangeService.getAllExchangeRates();
  }

  /**
   * 获取启用的兑换比例
   */
  @Get('rates/active')
  async getActiveExchangeRates() {
    return await this.exchangeService.getActiveExchangeRates();
  }

  /**
   * 根据币种对获取兑换比例
   */
  @Get('rate/:fromToken/:toToken')
  async getExchangeRate(
    @Param('fromToken') fromToken: string,
    @Param('toToken') toToken: string
  ) {
    return await this.exchangeService.getExchangeRate(fromToken, toToken);
  }

  /**
   * 计算兑换数量
   */
  @Get('calculate/:fromToken/:toToken')
  async calculateExchange(
    @Param('fromToken') fromToken: string,
    @Param('toToken') toToken: string,
    @Query('amount') amount: string
  ) {
    return await this.exchangeService.calculateExchange(fromToken, toToken, amount);
  }

  /**
   * 更新兑换比例
   */
  @Put('rate/:id')
  async updateExchangeRate(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto
  ) {
    return await this.exchangeService.updateExchangeRate(parseInt(id), updateExchangeRateDto);
  }

  /**
   * 启用/禁用兑换比例
   */
  @Put('rate/:id/toggle')
  async toggleExchangeRate(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return await this.exchangeService.toggleExchangeRate(parseInt(id), isActive);
  }

  /**
   * 删除兑换比例
   */
  @Delete('rate/:id')
  async deleteExchangeRate(@Param('id') id: string) {
    await this.exchangeService.deleteExchangeRate(parseInt(id));
    return { message: '兑换比例删除成功' };
  }
}