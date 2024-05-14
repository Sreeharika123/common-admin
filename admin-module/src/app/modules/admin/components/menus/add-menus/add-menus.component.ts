import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MenusService } from '../../../services/menus.service';
import { DropdownService } from 'src/app/shared/services/dropdown.service';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-add-menus',
  templateUrl: './add-menus.component.html',
  styleUrls: ['./add-menus.component.less']
})
export class AddMenusComponent {
  moduleList: any[] = [];
  parentMenuList: any[] = [];
  menuOrderList: any[] = [];
  menuId!: number;
  menusForm!: FormGroup;
  @Input() menusEditResponseData!: any;
  @Input() screenTitle: any;
  menusOffCanvas = inject(NgbActiveOffcanvas);
  addMenuTitle!: string;
  saveOrUpdateButton!: string;
  clearOrCancelButton!: string;

  constructor(private menuService: MenusService, private dropdownService: DropdownService, private messagePopupService: MessagePopupService) {
    this.menusForm = new FormGroup({
      menuCode: new FormControl('', [Validators.required]),
      menuTitle: new FormControl('', [Validators.required]),
      menuParentId: new FormControl(''),
      menuOrderId: new FormControl('', [Validators.required]),
      cssClass: new FormControl(''),
      menuTooltip: new FormControl('', [Validators.required]),
      routeNavigation: new FormControl('', [Validators.required]),
      isModule: new FormControl('')
    });
  }
  //inital load 
  ngOnInit(): void {
    this.dropdownService.getDropDowns('parentmenu').subscribe((data: any) => {
      this.parentMenuList = data.dataSetCollection.parentmenu;
    });
    for (let order = 1; order <= 100; order++) {
      this.menuOrderList.push(order);
    }
    if (this.menusEditResponseData.data) {
      this.menuId = this.menusEditResponseData.data.menuId;
      // patching the edit response  data to menusForm
      this.menusForm.patchValue(this.menusEditResponseData.data);
    }
    this.addMenuTitle = this.menusEditResponseData.data ? 'Edit ' + this.screenTitle : 'Add ' + this.screenTitle;
    this.saveOrUpdateButton = this.menusEditResponseData.data ? 'Update' : 'Save';
    this.clearOrCancelButton = this.menusEditResponseData.data ? 'Cancel' : 'Clear';
  }
  //clear function
  clear() {
    if (this.clearOrCancelButton == 'Cancel') {
      this.menusOffCanvas.close();
    }
    this.addMenuTitle = 'Add Menu Details';
    this.saveOrUpdateButton = 'Save';
    this.clearOrCancelButton = 'Clear';
    this.menusForm.reset();
    ///setting the Dropdowns values to show default select*///
    this.menusForm.get('moduleId')?.patchValue('');
    this.menusForm.get('menuParentId')?.patchValue('');
    this.menusForm.get('menuOrderId')?.patchValue('');
    this.menuId = 0;
  }
  //Save and Update Functionality here
  saveOrUpdateMenu(isValid: any) {
    if (isValid) {
      this.menusForm.value.fromScreen = this.menusEditResponseData.fromScreen;
      this.menusForm.value.menuParentId = this.menusForm.value.isModule ? 0 : this.menusForm.value.menuParentId;
      //if menuId is 0 then it goes for insert if not it goes for update
      this.menuService.addOrUpdateMenu(this.menuId, this.menusForm.value).subscribe((menuData: any) => {
        if (menuData.code !== 200) {
          //displaying Error Message if error
          this.messagePopupService.erroMessage(menuData.message);
        }
        else {
          this.menusOffCanvas.close(menuData);
        }
      });
    }
    else {
      //Showing error message
      Object.keys(this.menusForm.controls).forEach((key: any) => {
        this.menusForm.get(key)?.markAsTouched();
      });
    }
  }
  //dismiss offcanvas call
  dismiss() {
    this.menusOffCanvas.close(true);
  }
  //Validation functionality for Form Fields
  showError(formControlName: string) {
    const Control = this.menusForm.get(formControlName);
    return !!Control && Control.invalid && (Control.dirty || Control.touched);
  }
}
