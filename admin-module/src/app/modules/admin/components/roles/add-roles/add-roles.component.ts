import { Component, Input, inject } from '@angular/core';
import { RolesService } from '../../../services/roles.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-add-roles',
  templateUrl: './add-roles.component.html',
  styleUrls: ['./add-roles.component.less']
})
export class AddRolesComponent {
  @Input() roleInformation: any;
  @Input() screenTitle: any;
  moduleOffCanvas = inject(NgbActiveOffcanvas);
  roleForm!: FormGroup;
  addRoleTitle: string = '';
  saveButton: string = '';
  clearButton: string = '';
  constructor(private roleService: RolesService, private popUpService: MessagePopupService) {
    this.roleForm = new FormGroup({
      roleName: new FormControl('', [Validators.required]),
      roleAcronym: new FormControl('', [Validators.required])
    })
  }
  ngOnInit(): void {
    //here we check the roleID is presultent are not.
    let isRoleID = this.roleInformation.roleID > 0 ? true : false;
    // if roleID then we will patch the value.
    isRoleID ? this.roleForm.patchValue(this.roleInformation) : null;
    if (isRoleID) {
      this.roleForm.controls['roleAcronym'].disable();
    }
    this.saveButton = isRoleID ? "Update" : "Save";
    this.clearButton = isRoleID ? "Cancel" : "Clear";
    this.addRoleTitle = isRoleID ? "Edit " + this.screenTitle : "Add " + this.screenTitle;
  }
  //Save Role Functionality
  saveRole(isValid: boolean) {
    if (isValid) {
      this.roleForm.controls['roleAcronym'].enable();
      let formData = {
        ...this.roleForm.value,
        fromScreen: this.screenTitle
      }
      this.roleService.saveOrUpdate(this.roleInformation.roleID, formData).subscribe((data: any) => {
        // it returns the status code if success and failure
        if (data.code != 200) {
          this.popUpService.erroMessage(data.message);
        }
        else {
          this.moduleOffCanvas.close(data);
        }
      });
    } else {
      Object.keys(this.roleForm.controls).forEach((key: any) => { this.roleForm.get(key)?.markAsTouched(); });
    }
  }
  //dimsiss functionality
  dismiss() {
    this.moduleOffCanvas.close(true);
  }
  //Clear Or Cancel functionality
  clear() {
    this.clearButton == 'Cancel'
      ? this.moduleOffCanvas.close()
      : this.roleForm.reset();
  }
}
