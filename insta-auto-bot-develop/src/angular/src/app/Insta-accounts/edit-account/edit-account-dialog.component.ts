import {
  Component,
  Injector,
  OnInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import {
  RoleServiceProxy,
  RoleDto,
  PermissionDto, InstaDataFileType, InstaTemplateInputDto,
  InstagramAccountServiceProxy, InstaMessageInputDto
} from '@shared/service-proxies/service-proxies';
import { forEach as _forEach, map as _map } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';

@Component({
  templateUrl: 'edit-account-dialog.component.html',
  styleUrls: ['edit-account-dialog.component.html']

})
export class EditAccountUserDialogComponent extends AppComponentBase
  implements OnInit {
  saving = false;
  role = new RoleDto();
  uploadUrl: string;
  uploadedFiles: any[] = [];
  files = '';
  uploadedFileNames = []
  @Output() onSave = new EventEmitter<any>();
  fileInQue: boolean = false;
  baseUrl = AppConsts.remoteServiceBaseUrl;
  InstaTemplateInputDto: InstaTemplateInputDto;
  InstaMessageInputDto: InstaMessageInputDto;
  id: number;
  templateTags = [];
  messageTags = [];

  constructor(
    injector: Injector,
    private _roleService: RoleServiceProxy,
    public bsModalRef: BsModalRef,
    private _instagramAccountService: InstagramAccountServiceProxy,

  ) {
    super(injector);
    this.uploadUrl = this.baseUrl + "/File/UploadFiles";
  }

  onUpload(event): void {
    console.log(event);
    if (event.files.length > 0) {
      const originalEvent = event.originalEvent;
      if (originalEvent.body.success) {
        for (let file of event.files) {
          this.uploadedFiles.push(file);
        }
        console.log(originalEvent.body.result[0].fileName);
        console.log(originalEvent.body.result)
        originalEvent.body.result.map((res => {
          this.InstaTemplateInputDto.zipFileName = res.fileName;
        }))
        this.notify.success(this.l("File Uploaded"));
      } else {
        console.log(originalEvent.body.error.message);
      }
    }
    console.log(this.files)
  }
  onSelect(event) {
    this.fileInQue = true;
  }
  onRemove(event) {
    this.fileInQue = false;
  }
  onBeforeUpload(event): void {
    console.log("event", event);
    event.formData.append("instaDataFileType", InstaDataFileType._0);
  }
  onError(event) {
    console.log(event);
    let error: HttpErrorResponse = event.error;
    if (error) {
      console.log(error)
    }
  }
  removeFile() {
    this.InstaTemplateInputDto.zipFileName = '';
  }
  ngOnInit(): void {
    this.InstaTemplateInputDto = new InstaTemplateInputDto();
    this.InstaMessageInputDto = new InstaMessageInputDto();
    console.log(this.id);
    this.getInstaTemplateByInstaAccountId();
    // if (!this.InstaTemplateInputDto.postsIntervalInHours) this.InstaTemplateInputDto.postsIntervalInHours = 4;
    // if (!this.InstaTemplateInputDto.storiesIntervalInHours) this.InstaTemplateInputDto.storiesIntervalInHours = 4;
  }

  getInstaTemplateByInstaAccountId() {
    this._instagramAccountService.getInstaTemplateByInstaAccountId(this.id).subscribe(res => {
      this.InstaTemplateInputDto = res;
      this.templateTags = res.templateTags;
      this.files = this.InstaTemplateInputDto.zipFileName;
      console.log(res);
    })
  }
  onSelectTemplateTags(e) {
    console.log(e)
    if (e['key'] == 'Enter' && e.target.value != '') {
      this.templateTags.push(e.target.value);
      this.InstaTemplateInputDto.templateTags = this.templateTags;
      e.target.value = '';
    }
  }
  onRemoveTemplateTags(tag: string, i: number) {
    this.templateTags.splice(i, 1);
    this.InstaTemplateInputDto.templateTags = this.templateTags;
  }

  savePostTemplate(): void {
    console.log(this.InstaTemplateInputDto, 'saveMessageTemplate');
    this.InstaTemplateInputDto.instaAccountId = this.id;
    this.InstaTemplateInputDto.postsIntervalInHours = Number(this.InstaTemplateInputDto.postsIntervalInHours);
    this.InstaTemplateInputDto.storiesIntervalInHours = Number(this.InstaTemplateInputDto.storiesIntervalInHours);
    this._instagramAccountService.createInstaTemplate(this.InstaTemplateInputDto)
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.bsModalRef.hide();
        // this.onSave.emit();
      });
  }

  onSelectMessageTags(e) {
    console.log(e)
    if (e['key'] == 'Enter' && e.target.value != '') {
      this.messageTags.push(e.target.value);
      this.InstaMessageInputDto.messageTags = this.messageTags;
      e.target.value = '';
    }
  }
  onRemoveMessageTags(tag: string, i: number) {
    this.messageTags.splice(i, 1);
    this.InstaMessageInputDto.messageTags = this.messageTags;
  }

  saveMessageTemplate(): void {
    this.InstaMessageInputDto.instaAccountId = this.id;
    console.log(this.InstaMessageInputDto, 'saveMessageTemplate');
    this._instagramAccountService.sendInstaMessage(this.InstaMessageInputDto)
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.bsModalRef.hide();
      });
  }
  isValidTemplateTab() {
    return !(
      this.InstaTemplateInputDto.name && this.InstaTemplateInputDto.postsIntervalInHours
      && this.InstaTemplateInputDto.storiesIntervalInHours && this.templateTags.length > 0 &&
      this.InstaTemplateInputDto.zipFileName
    )
  }
  isValidMessageTab() {
    return !(
      this.InstaMessageInputDto.textMessage && this.messageTags.length > 0)
  }
}
