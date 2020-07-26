import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {IntroService} from '../../service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {DialogAction} from '../../object/DialogResult';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  categoryName: string;

  @Input()
  showStat: boolean;

  @Output()
  toggleStat = new EventEmitter<boolean>(); // показать/скрыть статистику

  @Output()
  toggleMenu = new EventEmitter(); // показать/скрыть статистику

  @Output() settingsChanged = new EventEmitter<boolean>();

  isMobile: boolean;

  constructor(private dialog: MatDialog,
              private introService: IntroService,
              private deviceDetector: DeviceDetectorService
  ) {
    this.isMobile = deviceDetector.isMobile();
  }

  ngOnInit(): void {
  }

  // окно настроек
  showSettings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent,
    {
      autoFocus: false,
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === DialogAction.SETTINGS_CHANGE) {
        this.settingsChanged.emit(true);
        return;
      }
    });
  }

  showIntroHelp() {
    this.introService.startIntroJS(false);
  }

  onToggleMenu() {
    this.toggleMenu.emit(); // показать/скрыть меню
  }

  // скрыть/показать статистику
  onToggleStat() {
    this.toggleStat.emit(!this.showStat); // вкл/выкл статистику
  }

}
