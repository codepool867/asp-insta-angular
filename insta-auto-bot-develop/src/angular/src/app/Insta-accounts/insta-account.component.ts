import { Component, Injector, OnInit } from '@angular/core';
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
  RoleDtoPagedResultDto,
  InstaAccountOutputDto,
  InstagramAccountServiceProxy, InstaAccountOutputDtoPagedResultDto
} from '@shared/service-proxies/service-proxies';
import { CreateBulkAccountsComponent } from './Create-bulk-accounts/create-bulk-accounts.component';
import { EditAccountUserDialogComponent } from './edit-account/edit-account-dialog.component';

class PagedRolesRequestDto extends PagedRequestDto {
  keyword: string;
}

@Component({
  templateUrl: './insta-account.component.html',
  animations: [appModuleAnimation()]
})
export class InstaAccountComponent extends PagedListingComponentBase<RoleDto> implements OnInit {
  roles: RoleDto[] = [];
  keyword = '';
  InstaAccountOutputDto = new InstaAccountOutputDto()
  pageNumber = 1;
  pageSize = 5;
  maxSize = 5;
  accounts: InstaAccountOutputDto[];
  totalAccountItems;
  constructor(
    injector: Injector,
    private _rolesService: RoleServiceProxy,
    private _instagramAccountService: InstagramAccountServiceProxy,
    private _modalService: BsModalService
  ) {
    super(injector);

  }
  ngOnInit() {
    this.getInstaAccounts();
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
  getInstaAccounts(keyword?) {
    this._instagramAccountService.getInstaAccounts(this.pageNumber, this.pageSize, keyword).subscribe(res => {
      console.log(res.items);
      this.accounts = res.items;
      this.totalAccountItems = res.totalCount;
    })
  }
  getDataPage(event?) {
    console.log(event)
    // this.startIndexPage = (event.page - 1) * event.itemsPerPage;

    this.getInstaAccounts(this.keyword)
  }
  pageChanged(event?) {
    console.log(event)
    if (event) {
      this.pageNumber = event.page;
      this.pageSize = event.itemsPerPage;
    }
    this.getInstaAccounts(this.keyword)
  }
  delete(role: RoleDto): void {
    abp.message.confirm(
      this.l('RoleDeleteWarningMessage', role.displayName),
      undefined,
      (result: boolean) => {
        if (result) {
          this._rolesService
            .delete(role.id)
            .pipe(
              finalize(() => {
                abp.notify.success(this.l('SuccessfullyDeleted'));
                this.refresh();
              })
            )
            .subscribe(() => { });
        }
      }
    );
  }
  onRefresh() {
    this.pageNumber=1;
    this.pageSize=5;
    this.totalAccountItems=null;
    this.ngOnInit();
  }
  editAccount(id): void {
    this.editBulkAccount(id);
  }

  createAccount(): void {
    this.showBulkAccountModal();
  }

  showBulkAccountModal(id?: number): void {
    let createOrEditBulkAccount: BsModalRef;
    if (!id) {
      createOrEditBulkAccount = this._modalService.show(
        CreateBulkAccountsComponent,
        {
          class: 'modal-lg',
        }
      );
    }
    createOrEditBulkAccount.content.onSave.subscribe(() => {
      this.getInstaAccounts();
    });
  }
  editBulkAccount(id?:string): void {
    let editBulkAccount: BsModalRef;
    editBulkAccount = this._modalService.show(
      EditAccountUserDialogComponent,
      {
        class: 'modal-lg',
        initialState: {
          id: id,
        },
      }
    );
  }
}
