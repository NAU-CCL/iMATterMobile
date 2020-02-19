import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';

const today = new Date();
const todaysDate = today.toISOString();

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})
export class AvailablePage implements OnInit {
  private surveys: Observable<Survey[]>;

  constructor(private fs: FireService) { }

  ngOnInit() {
    this.surveys = this.fs.getSurveys();
    console.log(today);
    console.log(todaysDate);
  }

  isDisplayed(survey: Survey){
    //index[0] = year, index[1] = month, index[2] = day, index[3] = hour, index[4] = minute,
    var startTime = survey.startTime.split(" ");
    //index[0] = year, index[1] = month, index[2] = day, index[3] = hour, index[4] = minute,
    var endTime = survey.endTime.split(" ");
    //index[0] = year, index[1] = month, index[2] = day, index[3] = hour, index[4] = minute,
    var currentTime = this.fs.getTime(todaysDate).split(" ");
    currentTime[3] = "" + today.getHours();

    console.log(startTime);
    console.log(endTime);
    console.log(currentTime);

    if(parseInt(currentTime[0]) >= parseInt(startTime[0]) && parseInt(currentTime[0]) <= parseInt(endTime[0])){
      if(parseInt(startTime[0]) == parseInt(endTime[0])){
        if(parseInt(currentTime[1]) >= parseInt(startTime[1]) && parseInt(currentTime[1]) <= parseInt(endTime[1])){
          if(parseInt(startTime[1]) == parseInt(endTime[1])){
            if(parseInt(currentTime[2]) >= parseInt(startTime[2]) && parseInt(currentTime[2]) <= parseInt(endTime[2])){
              if(parseInt(startTime[2]) == parseInt(endTime[2])){
                if(parseInt(currentTime[3]) >= parseInt(startTime[3]) && parseInt(currentTime[3]) <= parseInt(endTime[3])){
                  if(parseInt(startTime[3]) == parseInt(endTime[3])){
                    if(parseInt(currentTime[4]) >= parseInt(startTime[4]) && parseInt(currentTime[4]) <= parseInt(endTime[4])){
                      return true;
                    }
                    else{return false;}
                  }
                  if(parseInt(currentTime[3]) < parseInt(endTime[3])){
                    if(parseInt(currentTime[3]) > parseInt(startTime[3])){
                      return true;
                    }
                    if(parseInt(currentTime[4]) >= parseInt(startTime[4])){
                      return true;
                    }
                    else{return false;}                    
                  }
                  if(parseInt(currentTime[3]) == parseInt(endTime[3])){
                   if(parseInt(currentTime[4]) >= parseInt(endTime[4])){
                     return false;
                   } 
                   else{return true;}
                  }
                  else{return false;}
                }
                else{return false;}
              }
              if(parseInt(currentTime[2]) < parseInt(endTime[2])){
                if(parseInt(currentTime[2]) > parseInt(startTime[2])){
                  return true;
                }
                if(parseInt(currentTime[2]) == parseInt(startTime[2])){
                  if(parseInt(currentTime[3]) > parseInt(startTime[3])){
                    return true;
                  }
                  if(parseInt(currentTime[3]) == parseInt(startTime[3])){
                    if(parseInt(currentTime[4]) >= parseInt(startTime[4])){
                      return true;
                    }
                    else{return false;}
                  }
                  else{return false;}
                }
                else{return false;}
              }
              if(parseInt(currentTime[2]) == parseInt(endTime[2])){
                if(parseInt(currentTime[3]) == parseInt(endTime[3])){
                  if(parseInt(currentTime[4]) >= parseInt(endTime[4])){
                    return false;
                  }
                  else{return true;}
                }
                if(parseInt(currentTime[3]) < parseInt(endTime[3])){
                  return true;
                }
                else{return false;}
              }
              else{return false;}
            }
            else{return false;}
          }
          if(parseInt(currentTime[1]) < parseInt(endTime[1])){
            if(parseInt(currentTime[1]) > parseInt(startTime[1])){
              return true;
            }
            if(parseInt(currentTime[1]) == parseInt(startTime[1])){
              if(parseInt(currentTime[2]) > parseInt(startTime[2])){
                return true;
              }
              if(parseInt(currentTime[2]) == parseInt(startTime[2])){
                if(parseInt(currentTime[3]) > parseInt(startTime[3])){
                  return true;
                }
                if(parseInt(currentTime[3]) == parseInt(startTime[3])){
                  if(parseInt(currentTime[4]) >= parseInt(startTime[4])){
                    return true;
                  }
                  else{return false;}
                }
                else{return false;}
              }
              else{return false;}
            }
            else{return false;}
          }
          if(parseInt(currentTime[1]) == parseInt(endTime[1])){
            if(parseInt(currentTime[2]) < parseInt(endTime[2])){
              return true;
            }
            if(parseInt(currentTime[2]) == parseInt(endTime[2])){
              if(parseInt(currentTime[3]) < parseInt(endTime[3])){
                return true;
              }
              if(parseInt(currentTime[3]) == parseInt(endTime[3])){
                if(parseInt(currentTime[4]) < parseInt(endTime[4])){
                  return true;
                }
                else{return false;}
              }
              else{return false;}
            }
            else{return false;}
          }
          else{return false;}
        }
        else{return false;}
      }
      if(parseInt(currentTime[0]) < parseInt(endTime[0])){
        if(parseInt(currentTime[0]) > parseInt(startTime[0])){
          return true;
        }
        if(parseInt(currentTime[0]) == parseInt(startTime[0])){
          if(parseInt(currentTime[1]) > parseInt(startTime[1])){
            return true;
          }
          if(parseInt(currentTime[1]) == parseInt(startTime[1])){
            if(parseInt(currentTime[2]) > parseInt(startTime[2])){
              return true;
            }
            if(parseInt(currentTime[2]) == parseInt(startTime[2])){
              if(parseInt(currentTime[3]) > parseInt(startTime[3])){
                return true;
              }
              if(parseInt(currentTime[3]) == parseInt(startTime[3])){
                if(parseInt(currentTime[4]) >= parseInt(startTime[4])){
                  return true;
                }
                else{return false;}
              }
              else{return false;}
            }
            else{return false;}
          }
          else{return false;}
        }
        else{return false;}
      }
      if(parseInt(currentTime[0]) == parseInt(endTime[0])){
        if(parseInt(currentTime[1]) < parseInt(endTime[1])){
          return true;
        }
        if(parseInt(currentTime[1]) == parseInt(endTime[1])){
          if(parseInt(currentTime[2]) < parseInt(endTime[2])){
            return true;
          }
          if(parseInt(currentTime[2]) == parseInt(endTime[2])){
            if(parseInt(currentTime[3]) < parseInt(endTime[3])){
              return true;
            }
            if(parseInt(currentTime[3]) == parseInt(endTime[3])){
              if(parseInt(currentTime[4]) >= parseInt(endTime[4])){
                return false;
              }
              else{return true;}
            }
            else{return false;}
          }
          else{return false;}
        }
        else{return false;}
      }
      else{return false;}
    }
    else{return false;}
    
    return false;
  }


}
