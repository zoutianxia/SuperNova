function changeMission(mission)
{
  var element = document.getElementById('resTable');

  switch(mission.value)
  {
    case '1': // Attack
    case '2': // AKS
    case '5': // Hold
    case '6': // Spy
    case '8': // Recycle
    case '9': // Destroy
    case '15':// Explore
      element.style.display = "none";
    break;

    default:
      element.style.display = "inline";
    break;
  };
}

function speed_percent() {
  var sp = document.getElementsByName("speed")
  return sp.length ? sp[0].value : 10;
}

function setTarget(galaxy, solarsystem, planet, planet_type) {
  document.getElementsByName('galaxy')[0].value = galaxy;
  document.getElementsByName('system')[0].value = solarsystem;
  document.getElementsByName('planet')[0].value = planet;
  document.getElementsByName('planet_type')[0].value = planet_type;
}

function setMission(mission) {
  document.getElementsByName('order')[0].selectedIndex = mission;
  return;
}

function setACS(fleet_group) {
   document.getElementsByName('fleet_group')[0].value = fleet_group;
   return;
}

function setACS_target(acs_target_mr) {
   document.getElementsByName('acs_target_mr')[0].value = acs_target_mr;
   return;
}

function min(a, b) {
  a = a * 1;
  b = b * 1;
  if (a > b) {
    return b;
  } else {
    return a;
  }
}

function distance() {
  var thisGalaxy;
  var thisSystem;
  var thisPlanet;

  var targetGalaxy;
  var targetSystem;
  var targetPlanet;

  var dist = 0;

  targetGalaxy = document.getElementsByName("galaxy")[0].value;
  targetSystem = document.getElementsByName("system")[0].value;
  targetPlanet = document.getElementsByName("planet")[0].value;

  thisGalaxy = document.getElementsByName("thisgalaxy");
  if(thisGalaxy.length)
  {
    thisGalaxy = document.getElementsByName("thisgalaxy")[0].value;
    thisSystem = document.getElementsByName("thissystem")[0].value;
    thisPlanet = document.getElementsByName("thisplanet")[0].value;

    if ((targetGalaxy - thisGalaxy) != 0) {
      dist = Math.abs(targetGalaxy - thisGalaxy) * 20000;
    } else if ((targetSystem - thisSystem) != 0) {
      dist = Math.abs(targetSystem - thisSystem) * 5 * 19 + 2700;
    } else if ((targetPlanet - thisPlanet) != 0) {
      dist = Math.abs(targetPlanet - thisPlanet) * 5 + 1000;
    } else {
      dist = 5;
    }
  }
  else
  {
    dist = 20000;
  }

  return(dist);
}

function duration() {
  ret = Math.round(((35000 / speed_percent() * Math.sqrt(distance() * 10 / fleet_speed) + 10) / speed_factor ));
  return ret;
}

function consumption() {
  var consumption = 0;
  var spd = speed_percent() * Math.sqrt(fleet_speed);

  for (var i in ships) {
    shipcount = ships[i][0];
    shipspeed = ships[i][1];
    shipconsumption = ships[i][2];

    consumption += shipconsumption * shipcount  * (spd / Math.sqrt(shipspeed) / 10 + 1 ) * (spd / Math.sqrt(shipspeed) / 10 + 1 );
  }

  consumption = Math.round(distance() * consumption / 35000) + 1;
  return(consumption);
}

function probeConsumption() {
  var consumption = 0;
  var basicConsumption = 0;
  var values;
  var i;

  dist = distance();
  dur = duration();

  if (document.getElementsByName("ship210")[0]) {
    shipspeed = document.getElementsByName("speed210")[0].value;
    spd = 35000 / (dur * speed_factor - 10) * Math.sqrt(dist * 10 / shipspeed);

    basicConsumption = document.getElementsByName("consumption210")[0].value
    * document.getElementsByName("ship210")[0].value;
    consumption += basicConsumption * dist / 35000 * ((spd / 10) + 1) * ((spd / 10) + 1);
  }

  consumption = Math.round(consumption) + 1;
  return(consumption);
}

function unusedProbeStorage() {
  var stor =  document.getElementsByName('capacity210')[0].value * document.getElementsByName('ship210')[0].value - probeConsumption();

  return (stor>0) ? stor : 0;
}

function shortInfo() {
  document.getElementById("distance").innerHTML = sn_format_number(distance());

  var seconds = duration();
  if(seconds)
  {
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    document.getElementById("duration").innerHTML = hours + ":" + minutes + ":" + seconds;
  }
  else
  {
    document.getElementById("duration").innerHTML = "-";
  }
  var cons = consumption();

  element = document.getElementById("consumption");
  if(element)
  {
    element.innerHTML = sn_format_number(cons, 0, 'lime');
  }

  element = document.getElementById("capacity");
  if(element)
  {
    element.innerHTML = sn_format_number(fleet_capacity - cons, 0, 'lime');
  }
}

var fleet_consumption = 0;
var fleet_capacity    = 0;
var fleet_speed       = Infinity;

function fl_calc_stats(event, ui) {
  if(fleet_global_update)
  {
    return;
  }

  fleet_consumption = 0;
  fleet_capacity    = 0;
  fleet_speed       = Infinity;

  var ship_number = Array();

  for(i in ships)
  {
    ship_number[i] = jQuery('#ships' + i + 'slide').slider("value");
    if( ship_number[i] != 0)
    {
      fleet_speed = Math.min(fleet_speed, ships[i][1]);
      fleet_capacity += ship_number[i] * ships[i][3];
    }
  }


  var spd = speed_percent() * Math.sqrt(fleet_speed);
  for(i in ships)
  {
    if( ship_number[i] != 0)
    {
      fleet_consumption += ships[i][2] * ship_number[i]  * (spd / Math.sqrt(ships[i][1]) / 10 + 1 ) * (spd / Math.sqrt(ships[i][1]) / 10 + 1 );
    }
  }
  fleet_consumption = Math.round(distance() * fleet_consumption / 35000) + 1;
  if(fleet_capacity > 0)
  {
    fleet_capacity -= fleet_consumption;
  }
  else
  {
    fleet_consumption = 0;
  }

  document.getElementById('int_fleet_capacity').innerHTML = sn_format_number(fleet_capacity);
  document.getElementById('int_fleet_consumption').innerHTML = sn_format_number(fleet_consumption);
  if(fleet_speed == Infinity)
  {
    fleet_speed = '-';
  }
  else
  {
    fleet_speed = sn_format_number(fleet_speed);
  }
  document.getElementById('int_fleet_speed').innerHTML = fleet_speed;

  shortInfo();
}

function calculateTransportCapacity() {
  transportCapacity = fleet_capacity - check_resource(0) - check_resource(1) - check_resource(2);

  document.getElementById("remainingresources").innerHTML = sn_format_number(transportCapacity, 0, 'lime');

  if(transportCapacity<0)
  {
    document.getElementById("fleet_page2_submit").disabled = true;
  }
  else
  {
    document.getElementById("fleet_page2_submit").disabled = false;
  }
  return transportCapacity;
}

function setShips(s16,s17,s18,s19,s20,s21,s22,s23,s24,s25,s27,s28,s29)
{
  setNumber('202',s16);
  setNumber('203',s17);
  setNumber('204',s18);
  setNumber('205',s19);
  setNumber('206',s20);
  setNumber('207',s21);
  setNumber('208',s22);
  setNumber('209',s23);
  setNumber('210',s24);
  setNumber('211',s25);
  setNumber('213',s27);
  setNumber('214',s28);
  setNumber('215',s29);
}

function setNumber(name,number){
  if (typeof document.getElementsByName('ship'+name)[0] != 'undefined'){
    document.getElementsByName('ship'+name)[0].value=number;
  }
}

function abs(a) {
  return a < 0 ? -a : a;
}


var fleet_global_update = false;

function zero_fleet()
{
  fleet_global_update = true;
  for (i in ships)
  {
    jQuery('#ships' + i + 'slide').slider("value", 0);
  }
  fleet_global_update = false;
  fl_calc_stats();
}

function max_fleet()
{
  fleet_global_update = true;
  for (i in ships)
  {
    jQuery('#ships' + i + 'slide').slider("value", ships[i][0]);
  }
  fleet_global_update = false;
  fl_calc_stats();
}

function check_resource(id)
{
  var zi_res = parseInt(document.getElementById("resource" + id).value);
  if (isNaN(zi_res)){
    zi_res = 0;
  }

  document.getElementById('rest_res' + id).innerHTML = sn_format_number(resource_max[id] - zi_res, 0, 'white');

  return zi_res;
}

function zero_resource(id)
{
  element = document.getElementsByName('resource' + id)[0];

  if(element)
  {
    element.value = 0;
    jQuery("#resource" + id).trigger('change');
  }
  calculateTransportCapacity();
}

function zero_resources()
{
  for (i in resource_max)
  {
    zero_resource(i);
  }
  calculateTransportCapacity();
}

function max_resource(id) {
  if (document.getElementsByName("resource" + id)[0])
  {
    var freeCapacity = Math.max(fleet_capacity - check_resource(0) - check_resource(1) - check_resource(2), 0);
    var cargo = Math.min (freeCapacity + check_resource(id), resource_max[id]);

    document.getElementsByName("resource" + id)[0].value = cargo;
    jQuery("#resource" + id).trigger('change');
    calculateTransportCapacity();
  }
}

function max_resources()
{
  for (i in resource_max)
  {
    max_resource(i);
  }
  calculateTransportCapacity();
}

function fleet_dialog_show(caller, fleet_id)
{
  var fleet_html = '<table width=100%><tr><td class=c colspan=2>' + language[0] + '</td></tr>';
  var fleet = fleets[fleet_id][0];
  var resources = fleets[fleet_id][1];

  var ship_id;

  for(ship_id in fleet)
  {
    if(fleet[ship_id][1] != 0)
    {
      fleet_html += '<tr><th>';
      switch(fleet[ship_id][0])
      {
        default:
          fleet_html += fleet[ship_id][0];
        break;
      }
      fleet_html += '</th><th>' + fleet[ship_id][1] + '</th></tr>';
    }
  };

  if(parseInt(resources[0]) + parseInt(resources[1]) + parseInt(resources[2]) > 0)
  {
    fleet_html += '<tr><td class=c colspan=2>' + language [1] + '</td></tr>';

    for(res_id in resources)
    {
      if(parseInt(resources[res_id]))
      {
        fleet_html += '<tr><th>' + res_names[res_id] + '</th><th>' + sn_format_number(parseInt(resources[res_id]), 0, 'white') + '</th></tr>';
      }
    }
  }

  fleet_html += '</table>';

  fleet_dialog.dialog( "option", "position", [clientX, clientY + 20]);
  fleet_dialog.dialog("close");
  fleet_dialog.html(fleet_html);
  fleet_dialog.dialog("open");
}

function fleet_dialog_hide()
{
  fleet_dialog.dialog("close");
}