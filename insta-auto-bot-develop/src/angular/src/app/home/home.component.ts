import { Component, Injector,ChangeDetectionStrategy, OnInit} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
  PagedListingComponentBase,
  PagedRequestDto
} from '@shared/paged-listing-component-base';
import {
  RoleServiceProxy,
  RoleDto,
  RoleDtoPagedResultDto, InstagramAccountServiceProxy, InstaAccountOutputDto, InstaSummaryDto
} from '@shared/service-proxies/service-proxies';
class PagedRolesRequestDto extends PagedRequestDto {
  keyword: string;
}
@Component({
  templateUrl: './home.component.html',
  animations: [appModuleAnimation()],
})
export class HomeComponent extends PagedListingComponentBase<RoleDto> implements OnInit {
  roles: RoleDto[] = [];
  keyword = '';
  accounts:InstaAccountOutputDto[];
  dashBoardSummary: InstaSummaryDto;
  totalAccountItems;
  constructor(
    injector: Injector,
    private _rolesService: RoleServiceProxy,
    private _modalService: BsModalService,
    private _instagramAccountService: InstagramAccountServiceProxy,

  ) {
    super(injector);
  }
  ngOnInit(){
  this.getInstaAccounts();
  this.getInstaAccountsInfo();
  }

  list(
    request: PagedRolesRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;
    this._rolesService
      .getAll(request.keyword, request.skipCount, request.maxResultCount)
      .pipe(
        finalize(() => {
          finishedCallback();
        })
      )
      .subscribe((result: RoleDtoPagedResultDto) => {
        this.roles = result.items;
        this.showPaging(result, pageNumber);
      });
  }
  getInstaAccounts() {
    this._instagramAccountService.getInstaAccounts(this.pageNumber, this.pageSize, this.keyword).subscribe(res => {
      console.log(res.items);
      this.accounts=res.items;
      this.totalAccountItems=res.totalCount;
    })
  }

  getInstaAccountsInfo()
  {
    this._instagramAccountService.getInstaDashboardSummary().subscribe(res => {
      console.log(res);
      this.dashBoardSummary=res;
    })
  }


  delete(role: RoleDto): void {}

}

