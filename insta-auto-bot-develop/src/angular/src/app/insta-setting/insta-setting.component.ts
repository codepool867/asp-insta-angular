import {
  Component,
  Injector,
  OnInit,
  EventEmitter,
  Output, ViewChild
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import {
  RoleServiceProxy,
  RoleDto,
  PermissionDto, InstaDataFileType, InstaTemplateInputDto,
  InstagramAccountServiceProxy, InstaMessageInputDto,
  InstaSettingUpdateInputDto
} from '@shared/service-proxies/service-proxies';
import { forEach as _forEach, map as _map, split } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
interface Time {
  name: string,
  value: number
}
@Component({
  templateUrl: 'insta-setting.component.html',
  styleUrls: ['insta-setting.component.less']

})
export class InstaSettingComponent extends AppComponentBase
  implements OnInit {
  saving = false;
  role = new RoleDto();
  @Output() onSave = new EventEmitter<any>();
  InstaTemplateInputDto: InstaTemplateInputDto;
  InstaMessageInputDto: InstaMessageInputDto;
  InstaSettingUpdateInputDto: InstaSettingUpdateInputDto;
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  id: number;
  templateTags = [];
  messageTags = [];
  times: Time[];
  recipientTags: any;
  selectedPostsTime: Time;
  selectedStoriesTime: Time;
  skillsSet: any;  
  skills: string[] = [];  
  constructor(
    injector: Injector,
    private _roleService: RoleServiceProxy,
    private _instagramAccountService: InstagramAccountServiceProxy,

  ) {
    super(injector);
    this.times = [
      { name: 'Per hour', value: 0 },
      { name: 'Per day', value: 1 },
      { name: 'Per week', value: 2 },
    ];
  }

  ngOnInit(): void {
    this.InstaSettingUpdateInputDto = new InstaSettingUpdateInputDto();
    console.log(this.id);
    this.getInstaSettings();
    // setTimeout(() => {

    //   this.selectedPostsTime = this.times.filter(response => response.value == 1)[0];
    // }, 1000);
  }
  getInstaSettings() {
    this._instagramAccountService.getInstaSetting().subscribe(res => {
      this.InstaSettingUpdateInputDto = res;
      console.log(res);
      this.recipientTags = res.recipientTags;
      if (this.InstaSettingUpdateInputDto.recipientTags && this.InstaSettingUpdateInputDto.recipientTags.length > 0) {
        this.recipientTags = this.recipientTags.join('\n');
      }
    })
  }


  save(): void {
    this.saving = true;
    this.staticTabs.tabs[0].active = true;
    // if (this.InstaSettingUpdateInputDto.recipientTags && this.InstaSettingUpdateInputDto.recipientTags.length > 0) {
    //   this.recipientTags = this.recipientTags.join('\n');
    // }
    let splitString = this.recipientTags.split("\n");
    splitString = splitString && splitString.length > 0 ? splitString.filter(v => v != '') : '';
    this.InstaSettingUpdateInputDto.recipientTags = splitString && splitString.length > 0 ? splitString : '';
    this.InstaSettingUpdateInputDto.postIntervalValue = Number(this.InstaSettingUpdateInputDto.postIntervalValue)
    this.InstaSettingUpdateInputDto.messageIntervalValue = Number(this.InstaSettingUpdateInputDto.messageIntervalValue)
    this.InstaSettingUpdateInputDto.storyIntervalValue = Number(this.InstaSettingUpdateInputDto.storyIntervalValue)
    this.InstaSettingUpdateInputDto.postNumbers = Number(this.InstaSettingUpdateInputDto.postNumbers)
    this.InstaSettingUpdateInputDto.storyNumbers = Number(this.InstaSettingUpdateInputDto.storyNumbers)
    this.InstaSettingUpdateInputDto.messageNumbers = Number(this.InstaSettingUpdateInputDto.messageNumbers)
    console.log(this.InstaSettingUpdateInputDto, 'saveMessageTemplate');
    this._instagramAccountService.createOrUpdateInstaSettings(this.InstaSettingUpdateInputDto).subscribe(res => {
      this.saving = false;
      this.notify.info(this.l('SavedSuccessfully'));
    })
  }

  onSkillsSetKeydown() {  
    if (this.skillsSet == "" || this.skillsSet == null) return;  
    this.skills.push(this.skillsSet);  
    this.skillsSet = "";  
  }  
  
  dropSkill(index: any) {  
    this.skills.splice(index, 1);  
  }  


}
