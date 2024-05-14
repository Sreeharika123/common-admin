import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageComponent } from 'src/app/shared/components/message/message.component';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.less']
})
export class AddUsersComponent {
  @ViewChild('fileName') fileName!: ElementRef;
  addUserTitle!: string;
  clearButtonTitle!: string;
  saveButtonTitle!: string;
  userId!: number;
  required: string = "Required.";
  userTypeList: any[] = [];
  genderList = [
    { genderId: "", genderName: "--Select--" },
    { genderId: "M", genderName: "Male" },
    { genderId: "F", genderName: "Female" }
  ];
  roleList: any;
  subContractorTypeList: any;
  userForm!: FormGroup;
  uploadErrorMessage!: boolean;
  file: any;
  fileUpload: any;
  isExternal!:boolean;
  private userOffcanvas = inject(NgbActiveOffcanvas);
  private modalService = inject(NgbModal);
  @Input() userData: any;
  @Input() screenTitle: any;
  isUserType = false;
  
  constructor(private formBuilder: NonNullableFormBuilder, private service: UsersService) {
    this.userForm = this.formBuilder.group({
      roleID: ['', Validators.required],
      emailAddress: ['', Validators.required],
      firstName: ['', Validators.required],
      surname: ['', Validators.required],
      gender: ['', Validators.required],
      cellNumber: ['', Validators.required],
      userType: [''],
      externalType: ['']
    })
  };
  ngOnInit(): void {
    if (this.userData) {
      this.roleList = this.userData.roleList;
      this.userTypeList = this.userData.userTypeList;
      this.subContractorTypeList = this.userData.subContractorTypeList;
      this.userData.editUserInformation ? this.roleChange(this.userData.editUserInformation.roleID):'';
      this.userData.editUserInformation ? this.userForm.patchValue(this.userData.editUserInformation) : '';
    }
    this.addUserTitle=this.userData.editUserInformation?'Edit '+this.screenTitle:'Add '+this.screenTitle;
    this.saveButtonTitle = this.userData.editUserInformation ? "Update" : "Submit";
    this.clearButtonTitle = this.userData.editUserInformation ? "Cancel" : "Clear";
    this.userData.editUserInformation ?this.onUserChange(this.userData.editUserInformation.userType):'';
  };
  ngAfterViewInit(): void {
    /** binding the file name */
    if (this.userData.editUserInformation) {
      this.fileName.nativeElement.setAttribute('data-text', this.userData.editUserInformation.fileName);
    }
  }
  /** function for file change */
  onFilechange(event: any) {
    this.fileName.nativeElement.setAttribute('data-text', "");
    this.file = event.target.files[0];
    let reader = new FileReader();
    if (this.file) {
      this.fileName.nativeElement.setAttribute('data-text', this.file.name);
      reader.onload = this.handleReaderLoaded.bind(this, this.file);
      reader.readAsDataURL(this.file);
    }
    this.uploadErrorMessage = this.file ? false : true;
  };
  /** function for catching the file information */
  handleReaderLoaded(file: any, progressEvent: any) {
    const fileUpload = {
      fileName: file.name,
      savePath: 'Upload/Users/ProfilePics', /// for profileupload Pic
      filePath: 'Upload/Users/ProfilePics/' + file.name,
      fileAsBase64: progressEvent.target.result
    };
    this.fileUpload = fileUpload;
  };
  /** function for insert or update user information */
  saveUser(isValid: boolean) {
    if (isValid) {
      let userId = this.userData && this.userData.editUserInformation ? this.userData.userInformation.userID : 0;
      let userInformation = this.fileUpload ? { ...this.userForm.value, ...this.fileUpload } : { ...this.userForm.value, fileName: this.userData.editUserInformation.fileName, filePath: this.userData.editUserInformation.filePath };
      this.service.saveRupdateUserService(userId, { ...userInformation, fromScreen: this.screenTitle }).subscribe((data: any) => {
        // it returns the status code if success and failure
        const popupRef = this.modalService.open(MessageComponent);
        popupRef.componentInstance.data = { message: data.code == 200 && this.userData.editUserInformation ? `"${this.userForm.value.firstName} ${this.userForm.value.surname}" information updated successfully.` : `"${this.userForm.value.firstName} ${this.userForm.value.surname}" information submitted successfully.`, type: data.code == 200 ? 'success' : 'error' };
        this.userOffcanvas.close(data.code == 200 ? true : false);
      });
    } else {
      /////* Showing error message *//
      Object.keys(this.userForm.controls).forEach((key: any) => { this.userForm.get(key)?.markAsTouched() });
      this.uploadErrorMessage = this.fileUpload || this.userData.editUserInformation ? false : true;
    }
  };
  // userType change function
  onUserChange(user: any) {
    const DataCode = this.userTypeList.filter((x) => x.dataID == (user))[0].dataCode;
    if (DataCode == 'EXTR') {
      this.isExternal = true;
      this.userForm.controls['externalType'].setValidators([Validators.required]);
      this.userForm.get('externalType')?.updateValueAndValidity();
    }
    else {
      this.isExternal = false;
      this.userForm.controls['externalType'].setValue('');
      this.userForm.controls['externalType'].clearValidators();
      this.userForm.get('externalType')?.updateValueAndValidity();
    }
  }
  /*clear the form*/
  clear() {
    if (this.clearButtonTitle == 'Cancel') {
      this.userOffcanvas.close();
      this.userOffcanvas.close();
    }
    this.saveButtonTitle = 'Save';
    this.clearButtonTitle = 'Clear';
    this.fileName.nativeElement.setAttribute('data-text', "");
    this.isUserType = false;
    this.isExternal = false;
    this.userForm.reset();
    this.userId = 0;
    this.fileUpload = '';
  }
  /** closing the popup */
  dismiss() {
    this.userOffcanvas.close(true);
  };
  //* Validation functionality for leaving the 'Form Field' with out enter the value */
  showError(formControlName: string) {
    const control = this.userForm.get(formControlName);
    return !!control && control.invalid && (control.errors?.['required'] && control.touched);
  };
  /**
   * @param roleId
   * based on grtting Assessor roleId show and hide the User type field
   */
  roleChange(roleId: number) {
    const roleIdList = this.userData.roleList.filter((role: any) => { return role.roleID == roleId })[0];
    this.isUserType = roleIdList.roleName == "Assessor" ? true : false;
    this.userForm.controls['userType'].setValue('');
    this.isExternal = false;
    this.userForm.controls['externalType'].setValue('');
    if (this.isUserType) {
      // adding the required validator for user type
      this.userForm.controls['userType'].setValidators([Validators.required]);
      this.userForm.get('userType')?.updateValueAndValidity();
    } else {
      // removing the required validator for user type and external type
      this.userForm.controls['userType'].setValue('');
      this.userForm.controls['userType'].clearValidators();
      this.userForm.get('userType')?.updateValueAndValidity();
      this.userForm.controls['externalType'].setValue('');
      this.userForm.controls['externalType'].clearValidators();
      this.userForm.get('externalType')?.updateValueAndValidity();
    }
  }
}
