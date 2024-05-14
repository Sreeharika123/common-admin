import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ExportOperation, Operation } from 'src/app/shared/modals';
import { RolesService } from '../../services/roles.service';
import { AddRolesComponent } from './add-roles/add-roles.component';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { PdfExportService } from 'src/app/shared/services/pdf-export.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { offsetLimit } from 'src/app/core/constants/constants';
import { MessagePopupService } from 'src/app/shared/services/popup.service';
import { Utils } from 'src/app/shared/services/utils';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.less']
})
export class RolesComponent {
  paginationData: any;
  screenTitle!: string;
  statsData: any;
  screenData: any[] = [];
  dataSource: any[] = [];
  showStatus!: boolean;
  showEdit!: boolean;
  recordsPaginationLength: any[] = [];
  displayedColumns: any[] = ['roleName', 'roleAcronym'];
  displayTitles: any[] = ['Role Name', 'Role Acronym', 'Status', 'Edit'];
  displayHeaders: string[] = [
    'Active Roles', 'InActive Roles', 'Total Roles'
  ];
  recordsLengthForPagination: any;
  statsBoxColour: string[] = [
    'dash-color-box dash-bg-blue', 'dash-color-box dash-bg-lite-green', 'dash-color-box dash-bg-red'
  ];
  checkData = { roleID: 0, roleName: '', roleAcronoym: '' };
  rolesSearchForm!: FormGroup;
  roleTitle: string = 'Roles';
  //declaring paginator values
  offsetData = offsetLimit.offset;
  limitData = offsetLimit.limit;
  constructor(private rolesService: RolesService, private exportExcelService: ExcelExportService,
    private exportPdfService: PdfExportService, public authService: AuthService, private popUpService: MessagePopupService, public nonNullableFormBuilder: NonNullableFormBuilder) {
    this.rolesSearchForm = this.nonNullableFormBuilder.group({
      roleName: [''],
      roleAcronym: ['']
    })
  }
  ngOnInit(): void {
    this.getRolesData();
    this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    })
  }
  private offCanvasService = inject(NgbOffcanvas);
  //Function will check the emitted operation by common grid component
  checkOperation(operationalData: any) {
    switch (operationalData.operation) {
      case Operation.Add:
        this.addRoleData();
        break;
      case Operation.Edit:
        this.editRoleData(operationalData.data.roleID);
        break;
      case Operation.Delete:
        this.changeRoleStatus(operationalData.data.roleID);
        break;
      case Operation.Pagination:
        this.paginationData = operationalData;
        this.getRolesData();
        break;
    }
  }
  //gets the all roles details
  getRolesData() {
    const RolesSearchFormData = this.rolesSearchForm.value;
    if (this.paginationData) {
      this.offsetData = this.paginationData.data.offset;
      this.limitData = this.paginationData.data.limit;
    }
    const FormControlValues = {
      ...RolesSearchFormData,
      offset: this.offsetData,
      limit: this.limitData,
    };
    this.rolesService.getRoles(FormControlValues).subscribe((res) => {
      this.screenData = res.rolesData;
      this.recordsPaginationLength = res.stats.total;
      this.statsData = res.stats;
      this.showStatus = true;
      this.showEdit = true;
    })
  }
  //add functionality for adding role details
  addRoleData() {
    //this opens the offcanvas
    const OffCanvasReference = this.offCanvasService.open(AddRolesComponent, {
      position: 'end',
      panelClass: 'form-sm'
    });
    //the empty values present when an offcanvas opened
    OffCanvasReference.componentInstance.roleInformation = this.checkData;
    OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
    OffCanvasReference.result.then((data) => {
      if (data) {
        if (data.code == 200) {
          //displaying success message *///
          this.popUpService.successMessage("Role added successfully.");
          this.getRolesData();
        }
        else if (data.message) {
          //displaying error message*///
          this.popUpService.erroMessage(data.message);
        }
      }
    });
  };
  //edit functionality for editing role data
  editRoleData(roleId: number) {
    if (roleId) {
      this.rolesService.editRoles(roleId).subscribe((res: any) => {
        const OffCanvasReference = this.offCanvasService.open(AddRolesComponent, { position: 'end', panelClass: 'form-sm' });
        //the edited roleid details will be present when an offcanvas opens
        OffCanvasReference.componentInstance.roleInformation = res;
        OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
        OffCanvasReference.result.then((data) => {
          if (data) {
            if (data.code == 200) {
              //displaying success message *///
              this.popUpService.successMessage("Role updated successfully.");
              this.getRolesData();
            }
            else if (data.message) {
              //displaying error message
              this.popUpService.erroMessage(data.message);
            }
          }
        });
      });
    }
  };
  //Dropdown functionality for Export pdf and Excel*///
  exportDropDownOperation(exportData: any) {
    switch (exportData.exportOperation) {
      case ExportOperation.Export:
        this.exportRolesData(exportData.data)
        break;
    }
  }
  //status change  functionality*///
  changeRoleStatus(roleId: number) {
    //displaying confirm  message to change status through message component*//
    this.popUpService.confirmMessage().subscribe((confirm: boolean) => {
      if (confirm) {
        if (roleId) {
          // service call to change the Change status *////
          this.rolesService.changeRoleStatus(roleId,{fromScreen: this.roleTitle}).subscribe((responseData: any) => {
            if (responseData.code == 200) {
              //displaying success message 
              this.popUpService.successMessage("Role status changed successfully.");
              this.getRolesData();
            } else {
              this.popUpService.erroMessage(responseData.message);
            }
          });
        }
      }
    });
  };
  //clearRolesForm functionality reset the form
  clearRolesForm() {
    this.rolesSearchForm.reset();
    this.getRolesData();
  }
  //search roles functionality
  searchRolesData() {
    if (Utils.hasValue(this.rolesSearchForm.value)) {
      this.getRolesData();
    }
    //if no input is filled then showing error message
    else {
      this.popUpService.informationMessage('Please enter atleast one field.');
    }
  };
  //export to excel or pdf
  exportRolesData(excel: any) {
    //getting all data 
    this.rolesService.getRoles({ ...this.rolesSearchForm.value, isDataExport: true, DataExportType: excel.dataExportType, FromScreen: this.roleTitle })
      .subscribe((rolesExportData: any) => {
        let exportData = rolesExportData.vnaBmsExportInformation.exportRolesDetails;
        if (excel.dataExportType == "excel") {
          // calling export to excel service 
          this.exportExcelService.exportAsExcel({
            data: exportData,
            fileName: this.roleTitle,
          });
        } else {
          // calling export to pdf service 
          this.exportPdfService.exportAsPdf({
            data: exportData,
            fileName: this.roleTitle,
          });
        }
      });
  }
}
