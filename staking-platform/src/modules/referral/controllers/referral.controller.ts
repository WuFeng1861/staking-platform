import { Controller, Post, Get, Body, Query, Param, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReferralService } from '../services/referral.service';
import { BindReferralDto } from '../dto/bind-referral.dto';
import { QuerySubordinatesDto } from '../dto/query-subordinates.dto';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';

@Controller('referral')
@UseInterceptors(TransformInterceptor)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * 绑定上级
   * @param bindReferralDto 绑定上级DTO
   */
  @Post('bind')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bindReferrer(@Body() bindReferralDto: BindReferralDto) {
    return this.referralService.bindReferrer(bindReferralDto);
  }

  /**
   * 查询下级数量
   * @param queryDto 查询参数
   */
  @Get('subordinates/count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSubordinatesCount(@Query() queryDto: QuerySubordinatesDto) {
    return this.referralService.getSubordinatesCount(queryDto);
  }

  /**
   * 根据地址获取推荐人关系
   * @param address 用户地址
   * @param chainId 链ID
   */
  @Get('referrer/:address')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getReferralByAddress(
    @Param('address') address: string,
    @Query('chainId') chainId: string
  ) {
    const chainIdNum = parseInt(chainId);
    return this.referralService.getReferralByAddress(address, chainIdNum);
  }
}
