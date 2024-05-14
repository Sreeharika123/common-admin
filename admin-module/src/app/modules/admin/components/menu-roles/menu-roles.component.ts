import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownService } from 'src/app/shared/services/dropdown.service';
import { MenuRolesService } from '../../services/menu-roles.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UserMenusService } from 'src/app/core/services/user-menus.service';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-menu-roles',
  templateUrl: './menu-roles.component.html',
  styleUrls: ['./menu-roles.component.less']
})
export class MenuRolesComponent {
  userRolesList: any[] = [];
  menusList!: any[];
  screenTitle!: string;
  constructor(private menuRoleService: MenuRolesService, private dropdownService: DropdownService,
    private authService: AuthService, private userMenuService: UserMenusService, private messagePopupService: MessagePopupService) { }
  menuRolesForm: any = new FormGroup({
    roles: new FormControl('', Validators.required)
  });
  ngOnInit(): void {
    //getting drodowns data intitially
    this.getDropdown();
    //geting initial menus tree
    this.initialMenusLoad();
    this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    })
  }
  //loading menus initially
  initialMenusLoad() {
    const RoleId = 0;
    this.menuRoleService.getMenusbyRoleID(RoleId).subscribe((menuRoleData: any) => {
      this.menusList = this.processMenuRoles(menuRoleData, 'menuID', 'menuParentID');
    });
  }
  // here we are getting dropdown data using dropdown service
  getDropdown() {
    this.dropdownService.getDropDowns('roles')
      .subscribe((data: any) => {
        this.userRolesList = data.dataSetCollection.roles;
      });
  }
  //get menus on role change
  onRoleChange(roleId: number) {
    if (roleId) {
      this.menuRoleService.getMenusbyRoleID(roleId).subscribe((menuRoleData: any) => {
        this.menusList = this.processMenuRoles(menuRoleData, 'menuID', 'menuParentID');
      });
    } else {
      this.initialMenusLoad();
    }
  }
  //getting parent and childrens and seperated into list
  processMenuRoles(
    data: any,
    primaryIdName: string,
    parentIdName: string
  ) {
    if (!data || data.length == 0 || !primaryIdName || !parentIdName)
      return [];
    var tree: any[] = [],
      rootIds: any[] = [],
      item = data[0],
      primaryKey = item[primaryIdName],
      treeObjs: any = {},
      parentId: any,
      parent: any,
      dataLength = data.length,
      i = 0;
    for (var j = 0; j < data.length; j++) {
      treeObjs[data[j][primaryIdName]] = data[j];
    }
    while (i < dataLength) {
      item = data[i++];
      item.expand = false; // initially expand menus false
      item.checked = item.readPermission;
      primaryKey = item[primaryIdName];
      treeObjs[primaryKey] = item;
      parentId = item[parentIdName];
      if (parentId) {
        parent = treeObjs[parentId];
        if (parent) {
          if (parent.children) {
            parent.children.push(item);
          } else {
            parent.children = [item];
          }
        }
      } else {
        rootIds.push(primaryKey);
      }
    }
    for (var i = 0; i < rootIds.length; i++) {
      tree.push(treeObjs[rootIds[i]]);
    }
    return tree;
  }
  //arrow mark click changes
  checkMinusSquare(item: any) {
    let response: boolean = false;
    if (item.children) {
      const Count = item.children.filter((x: { checked: boolean; }) => x.checked == true).length;
      if (Count > 0) {
        response = true;
      }
      else {
        response = false;
      }
    }
    return response;
  }
  //parent menus click event. parent && children checkboxs value changes.
  checkParent(item: any) {
    item.checked = !item.checked;
    item.readPermission = item.checked;
    item.writePermission = item.checked;
    item.modifyPermission = item.checked;
    item.deletePermission = item.checked;
    if (item.children && item.children.length > 0) {
      item.children.map((x: { checked: boolean; }) => x.checked = item.checked);
      item.children.map((x: { readPermission: boolean; }) => x.readPermission = item.checked);
      item.children.map((x: { writePermission: boolean; }) => x.writePermission = item.checked);
      item.children.map((x: { modifyPermission: boolean; }) => x.modifyPermission = item.checked);
      item.children.map((x: { deletePermission: boolean; }) => x.deletePermission = item.checked);
    }
  }
  //child menus click event. parent && children checkboxs value changes.
  checkChild(child: any, item: any) {
    child.checked = !child.checked;
    child.readPermission = !child.readPermission;
    child.writePermission = child.readPermission;
    child.modifyPermission = child.readPermission;
    child.deletePermission = child.readPermission;
    const Count = item.children.filter((c: { checked: boolean; }) => c.checked == true).length;
    if (Count == 0) {
      item.checked = false;
      item.readPermission = item.checked;
      item.writePermission = item.checked;
      item.modifyPermission = item.checked;
      item.deletePermission = item.checked;
    }
    else {
      item.checked = true;
      item.readPermission = item.checked;
      item.writePermission = item.checked;
      item.modifyPermission = item.checked;
      item.deletePermission = item.checked;
    }
  }
  //child menus permissions checkbox click event
  menuChildPermissionsChange(type: string, item: any, child: any) {
    switch (type) {
      case 'read':
        child.checked = child.readPermission;
        if (child.readPermission) {
          item.checked = child.readPermission;
          item.readPermission = item.checked;
          item.writePermission = item.checked;
          item.modifyPermission = item.checked;
          item.deletePermission = item.checked;
        } else {
          child.writePermission = child.checked;
          child.modifyPermission = child.checked;
          child.deletePermission = child.checked;
        }
        break;
      case 'write':
      case 'modify':
      case 'delete':
        child.readPermission = true;
        child.checked = child.readPermission;
        item.readPermission = child.checked;
        item.writePermission = child.checked;
        item.modifyPermission = child.checked;
        item.deletePermission = child.checked;
        break;
    }
    const Count = item.children.filter((c: { checked: boolean; }) => c.checked == true).length;
    if (Count == item.children.length || Count > 0) {
      item.checked = true;
    }
    else {
      item.checked = false;
    }
    //if all childs false then their parent false
    const ChildsFalseCount = item.children.filter((c: { checked: boolean; }) => c.checked == false).length;
    if (ChildsFalseCount == item.children.length) {
      item.checked = false;
      item.readPermission = item.checked;
      item.writePermission = item.checked;
      item.modifyPermission = item.checked;
      item.deletePermission = item.checked;
    }
  }
  //submit button functionality
  saveMenuRoles() {
    if (this.menuRolesForm.valid) {
      let selectedMenus = this.getSelectedMenusList(this.menusList);
      let roleId = this.menuRolesForm.value.roles;
      let fromScreen = this.screenTitle;
      //service call 
      this.menuRoleService
        .saveOrUpdateMenus(roleId, selectedMenus, fromScreen)
        .subscribe((serviceReturningData: any) => {
          if (serviceReturningData.code == 200) {
            //displaying success message
            this.messagePopupService.successMessage("Successfully mapped.");
            let stringUserData = this.authService.getVnaBmsUserData();
            if (stringUserData) {
              let userID = JSON.parse(stringUserData).userID;
              this.userMenuService.getUserMenus(userID).subscribe((menusData: any) => {
                this.userMenuService.setMenus(menusData);
                sessionStorage.setItem('Vnabms_user_menu_data', JSON.stringify(menusData));
              });
            }
          }
          //displaying error message
          else {
            this.messagePopupService.erroMessage(serviceReturningData.message);
          }
          this.clearMenuRolesForm();
        });
    } else {
      //showing error message
      Object.keys(this.menuRolesForm.controls).forEach((key: any) => {
        this.menuRolesForm.get(key)?.markAsTouched();
      });
    }
  }
  //clear functionality for fields and check box deselect 
  clearMenuRolesForm() {
    this.menuRolesForm.reset();
    this.menuRolesForm.get('roles').patchValue('');
    this.initialMenusLoad();
  }
  //selected all parent and child menus getting pushed into one list
  getSelectedMenusList(menusList: any) {
    let selectedMenusList: any[] = [];
    selectedMenusList.push(...menusList.filter((x: { readPermission: boolean; }) => x.readPermission == true));

    menusList.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        selectedMenusList.push(...item.children.filter((c: { readPermission: boolean; }) => c.readPermission == true));
      }
    });
    return selectedMenusList;
  }
  //expand all menus
  expandAll() {
    this.menusList.map(m => m.expand = true);
    this.menusList.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        item.children.map((c: { expand: boolean; }) => c.expand = true);
      }
    });
  }
  //collapse all menus
  collapseAll() {
    this.menusList.map(m => m.expand = false);
    this.menusList.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        item.children.map((c: { expand: boolean; }) => c.expand = false);
      }
    });
  }
  //For Validating required fields
  showError(formControlName: string) {
    const Control = this.menuRolesForm.get(formControlName);
    return !!Control && Control.invalid && (Control.dirty || Control.touched);
  }
}
