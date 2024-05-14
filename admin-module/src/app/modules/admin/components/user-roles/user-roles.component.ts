import { Component, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {  NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, debounceTime, distinctUntilChanged, filter, map, merge } from 'rxjs';
import { UserRolesService } from '../../services/user-roles.service';
import { DropdownService } from 'src/app/shared/services/dropdown.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.less']
})
export class UserRolesComponent {
  screenTitle!: string;
  rolesList: any[] = [];
  usersList: any[] = [];
  editRolesData: any;
  userRolesForm!: FormGroup;
  @ViewChild('roles', { static: true }) roles!: NgbTypeahead;
  click$ = new Subject<string>();
  instance: any;
  fromScreen: string = 'User Roles';
  constructor(private service: UserRolesService, private dropDownService: DropdownService, public authService: AuthService, public messagePopupService: MessagePopupService) {
    this.userRolesForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
    })
  }
  ngOnInit(): void {
    this.getDropDown();
    this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    })
  }
  ///Typeahead functionalities starts here **//
  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.roles.isPopupOpen()));

    return merge(debouncedText$, clicksWithClosedPopup$).pipe(
      map((term) => this.filterUser(term)
      ),
    );
  };

  filterUser(term: any) {
    let userRolesData = [...this.usersList];
    return userRolesData.filter((v: any) => v.fullName.toLowerCase().indexOf(term.toLowerCase()) > -1).map((user) => { return user.fullName })
  }
  ///Typeahead functionalities ends here **//

  ///*Dropdown serivce call*///
  getDropDown() {
    this.dropDownService.getDropDowns('roles,allusers').subscribe((data: any) => {
      this.rolesList = data.dataSetCollection.roles;
      this.usersList = data.dataSetCollection.allusers;
      this.rolesList = this.rolesList.map((item: any) =>
        Object.assign({}, item, { selected: false }, { disable: false })
      );
    })
  }
  ////get the user roles data serive call*//
  getUserRoles(event: any) {
    let UserId = this.usersList.filter((x: any) => x.fullName === event.item)[0].userID;
    this.rolesList.forEach((role: any) => {
      role.selected = false;
      role.disable = false;
    });
    this.service.getEditRoles(UserId).subscribe((rolesData: any) => {
      this.editRolesData = rolesData;
      this.editRolesData.forEach((editRole: any) => {
        let DisplayRole = this.rolesList.filter((role: any) => {
          return role.roleID == editRole.roleID;
        })[0];
        if (DisplayRole) {
          DisplayRole.selected = true;
        }
        if (editRole.isDefaultRole == 'Y') {
          DisplayRole.disable = true;
        }
      });
    });
  }
  // // here we are saving the roles for user*//
  saveUserRoles() {
    if (this.userRolesForm.valid) {
      let userId = this.usersList.filter((x: any) => x.fullName === this.userRolesForm.value.userName)[0].userID;
      let rolesList = this.rolesList.filter((role: any) => {
        return role.selected == true;
      });
      let roleIdData: any[] = [];
      rolesList.forEach((role: any) => {
        roleIdData.push(role.roleID);
      });
      if (userId) {
        this.service.saveUserRoles(userId, { RoleID: roleIdData.join(','), FromScreen: this.fromScreen }).subscribe((data: any) => {
          if (data.code == 200) {
            this.messagePopupService.successMessage('User roles updated successfully.');
          } else {
            this.messagePopupService.erroMessage(data.message);
          }
        });
      }
    }
    else {
      /////Showing error message*//
      Object.keys(this.userRolesForm.controls).forEach((key: any) => {
        this.userRolesForm.get(key)?.markAsTouched();
      });
      this.messagePopupService.informationMessage('Please select user.');
    }
    this.clearUserRoles();
    this.userRolesForm.reset();
  }
  // //clear form code.
  clearUserRoles() {
    this.rolesList.forEach((role: any) => {
      role.selected = false;
      role.disable = false;
    });
    this.userRolesForm.reset();
  }
  ngOnDestory() {
    this.click$.complete();
  }
}
