import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangepasswordService } from '../../services/changepassword.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less']
})

export class ChangePasswordComponent {
  screenTitle!: string;
  showPassWordOld: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;
  oldPasswordAndNewPassword!: boolean;
  oldPasswordAndConfirmNewPassword!: boolean;
  newPasswordAndConfirmNewPassword!: boolean;
  allFieldErrorMessage!: boolean;
  capitalCasePassword: boolean = false;
  smallCasePassword: boolean = false;
  numberPassword: boolean = false;
  specilCharecterPassword: boolean = false;
  minimumAndMaximum: boolean = false;
  updateButtonDisable: boolean = true;
  logginUserId: any;
  changePassword!: FormGroup;
  constructor(private changePasswordService: ChangepasswordService,
    private authService: AuthService, private messagePopupService: MessagePopupService) {
    this.changePassword = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15)]),
      confirmNewPassword: new FormControl('', Validators.required)
    })
  }
  ngOnInit(): void {
    this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    })
  }
  updatePassword() {
    let GetUserId: any = this.authService.getVnaBmsUserData();
    let UserDetails = JSON.parse(GetUserId);
    this.logginUserId = UserDetails.userID;
    let ChangePasswordDetails = {
      userID: this.logginUserId,
      Password: this.changePassword.value.oldPassword?.trim(),
      newPassword: this.changePassword.value.newPassword?.trim(),
      fromScreen: this.screenTitle
    };
    this.changePasswordService.updatePassword(ChangePasswordDetails).subscribe((data: any) => {
      if (data.message) {
        this.messagePopupService.erroMessage(data.message);
      }
      else if (data.code == 200) {
        this.messagePopupService.successMessage('Password Updated Successfully');
      }
    })
    this.clear();
  }
  showAndHide() {
    this.updateButtonDisable = true;
    let OldPassword = this.changePassword.value.oldPassword?.trim();
    let NewPassword = this.changePassword.value.newPassword?.trim();
    let ConfirmNewPassword = this.changePassword.value.confirmNewPassword?.trim();
    if (this.changePassword.invalid) {
      this.updateButtonDisable = true;
      this.oldPasswordAndNewPassword = false;
      this.oldPasswordAndConfirmNewPassword = false;
      this.newPasswordAndConfirmNewPassword = false;
      this.allFieldErrorMessage = true;
    }
    else if (NewPassword.length < 6) {
      this.updateButtonDisable = true;
      this.oldPasswordAndNewPassword = false;
      this.oldPasswordAndConfirmNewPassword = false;
      this.newPasswordAndConfirmNewPassword = false;
      this.allFieldErrorMessage = false;
    }
    else if (OldPassword == NewPassword) {
      /** validating the Old and New password */
      this.oldPasswordAndNewPassword = true;
      this.oldPasswordAndConfirmNewPassword = false;
      this.newPasswordAndConfirmNewPassword = false;
      this.allFieldErrorMessage = false;
    }
    else if (OldPassword == ConfirmNewPassword) {
      /** validating the Old and Confirm New password */
      this.oldPasswordAndNewPassword = false;
      this.oldPasswordAndConfirmNewPassword = true;
      this.newPasswordAndConfirmNewPassword = false;
      this.allFieldErrorMessage = false;

    }
    else if (NewPassword != ConfirmNewPassword) {
      /** validating the New and Confirm New password */
      this.oldPasswordAndNewPassword = false;
      this.oldPasswordAndConfirmNewPassword = false;
      this.newPasswordAndConfirmNewPassword = true;
      this.allFieldErrorMessage = false;

    }
    else {
      if (this.capitalCasePassword || this.smallCasePassword || this.numberPassword || this.specilCharecterPassword) {
        this.updateButtonDisable = true;
        this.oldPasswordAndNewPassword = false;
        this.oldPasswordAndConfirmNewPassword = false;
        this.newPasswordAndConfirmNewPassword = false;
        this.allFieldErrorMessage = false;
      }
      else {
        this.updateButtonDisable = false;
        this.oldPasswordAndNewPassword = false;
        this.oldPasswordAndConfirmNewPassword = false;
        this.newPasswordAndConfirmNewPassword = false;
        this.allFieldErrorMessage = false;
      }
    }
  }

  clear() {
    this.changePassword.reset();
    this.updateButtonDisable = true;
    this.oldPasswordAndNewPassword = false;
    this.oldPasswordAndConfirmNewPassword = false;
    this.newPasswordAndConfirmNewPassword = false;
    this.allFieldErrorMessage = false;
    this.showPassWordOld = false;
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
    this.capitalCasePassword = false;
    this.smallCasePassword = false;
    this.numberPassword = false;
    this.specilCharecterPassword = false;
    this.minimumAndMaximum = false;
  }
  newPwdValidationCheck() {
    let NewPassword = this.changePassword.value.newPassword?.trim();
    /** Regular Expressions. */
    var regex = new Array();
    regex.push('[A-Z]'); /** Uppercase Alphabet.*/
    regex.push('[a-z]'); /** Lowercase Alphabet. */
    regex.push('[0-9]'); /** Digit. */
    regex.push('[$@$!%*#?&]'); //Special Character.
    var passed = 0;
    /** Validate for each Regular Expression. */
    for (var i = 0; i < regex.length; i++) {
      if (new RegExp(regex[i]).test(NewPassword)) {
        switch (i) {
          case 0:
            this.capitalCasePassword = false;
            break;
          case 1:
            this.smallCasePassword = false;
            break;
          case 2:
            this.numberPassword = false;
            break;
          case 3:
            this.specilCharecterPassword = false;
            break;
        }
        passed++;
      }
      else {
        switch (i) {
          case 0:
            this.capitalCasePassword = true;
            break;
          case 1:
            this.smallCasePassword = true;
            break;
          case 2:
            this.numberPassword = true;
            break;
          case 3:
            this.specilCharecterPassword = true;
            break;
        }
        passed--;
      }
    }
    /** Validate for length of Password. */
    if (passed == 4 && NewPassword.length >= 8 && NewPassword.length <= 15) {
      this.minimumAndMaximum = false;
      passed++;
    }
    else {
      this.minimumAndMaximum = true;
      passed--;
    }
  }
}
