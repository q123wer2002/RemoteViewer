<?php
	//cnc table
	$CNC = array(
		"TABLE"			=> "cnc",
		"ALL"			=> "cnc.*",
		"ID"			=> "cnc.cnc_id",
		"SERIALNO"		=> "cnc.serial_no",
		"MACHINE"		=> "cnc.machine",
		"MACHINETYPE"	=> "cnc.machine_type",
		"VERSION"		=> "cnc.version",
		"GROUPID"		=> "cnc.cnc_group_id",
		"IP"			=> "cnc.ip",
		"MACADDR"		=> "cnc.mac_addr",
		"NAME"			=> "cnc.name",
		"IMG"			=> "cnc.img",
	);
	
	//cnc_alarm table
	$CNCALARM = array(
		"TABLE"			=> "cnc_alarm",
		"ALL"			=> "cnc_alarm.*",
		"CNCID"			=> "cnc_alarm.cnc_id",
		"ALARMMSG"		=> "cnc_alarm,alarm_msg",
		"ALARMTIME"		=> "cnc_alarm.alarm_time",
		"UPDATETIME"	=> "cnc_alarm.update_time",
	);
	
	//cnc_alarm_history table
	$CNCALARMHISTORY = array(
		"TABLE"			=> "cnc_alarm_history",
		"ALL"			=> "cnc_alarm_history.*",
		"CNCID"			=> "cnc_alarm_history.cnc_id",
		"ALARMHISFILE"	=> "cnc_alarm_history.alarm_history",
	);

	//cnc_group table
	$GROUP = array(
		"TABLE"			=> "cnc_group",
		"ALL"			=> "cnc_group.*",
		"ID"			=> "cnc_group.cnc_group_id",
		"NAME"			=> "cnc_group.name",
		"FACTORYID"		=> "cnc_group.factory_id",
	);

	//cnc_record table
	$CNCRECORD = array(
		"TABLE"				=> "cnc_record",
		"ALL"				=> "cnc_record.*",
		"CNCID"				=> "cnc_record.cnc_id",
		"POWERONTIME"		=> "cnc_record.poweron_time",
		"CYCLETIME"			=> "cnc_record.cycletime",
		"TOTALCYCLETIME"	=> "cnc_record.total_cycletime",
		"PARTCOUNT"			=> "cnc_record.partcount",
		"REQUIRECOUNT"		=> "cnc_record.require_partcount",
		"TOTALCOUNT"		=> "cnc_record.total_partcount",
		"LASTWORKTIME"		=> "cnc_record.lastwork_time",
		"WORKFILE"			=> "cnc_record.workfile",
		"WORKFILEUPDATETIME"=> "cnc_record.workfile_updatetime",
		"UPDATETIME"		=> "cnc_record.update_time",
	);

	//cnc_routine table
	$CNCROUTINE = array(
		"TABLE"			=> "cnc_routine",
		"ALL"			=> "cnc_routine.*",
		"ROUTINEID"		=> "cnc_routine.routine_id",
		"COMPANYID"		=> "cnc_routine.company_id",
		"NAME"			=> "cnc_routine.name",
		"ROUTINE"		=> "cnc_routine.routine",
	);

	//cnc_schedule table
	$CNCSCHEDULE = array(
		"TABLE"			=> "cnc_schedule",
		"ALL"			=> "cnc_schedule.*",
		"SCHEDULEID"	=> "cnc_schedule.cnc_schedule_id",
		"ROUTINEID"		=> "cnc_schedule.cnc_routine_id",
		"FACTORYID"		=> "cnc_schedule.cnc_fid",
		"GROUPID"		=> "cnc_schedule.cnc_gid",
		"CNCID"			=> "cnc_schedule.cnc_id",
	);

	//cnc_status table
	$CNCSTATUS = array(
		"TABLE"			=> "cnc_status",
		"ALL"			=> "cnc_status.*",
		"STATUSID"		=> "cnc_status.cnc_status_id",
		"STATUS"		=> "cnc_status.status",
		"MODE"			=> "cnc_status.mode",
		"ALARM"			=> "cnc_status.alarm",
		"EMG"			=> "cnc_status.emg",
		"MAINPROG"		=> "cnc_status.main_prog",
		"CURPROG"		=> "cnc_status.cur_prog",
		"CNCID"			=> "cnc_status.cnc_id",
		"UPDATETIME"	=> "cnc_status.update_time",
	);

	//cnc_time table
	$CNCTIME = array(
		"TABLE"			=> "cnc_time",
		"ALL"			=> "cnc_time.*",
		"TIMESTATUS"	=> "cnc_time.TimeStatus",
		"TIMESTART"		=> "cnc_time.TimeStart",
		"TIMEEXPIRE"	=> "cnc_time.TimeExpire",
		"TIMEREMAIN"	=> "cnc_time.TimeRemain",
		"TIMECURRENT"	=> "cnc_time.TimeCurrent",
		"CNCID"			=> "cnc_time.cnc_id",
		"TIMEOFOPENING"	=> "cnc_time.TimeOfOpening",
		"AGENTTIME"		=> "cnc_time.update_time",
	);

	//company table
	$COMPANY = array(
		"TABLE"			=> "company",
		"ALL"			=> "company.*",
		"ID"			=> "company.company_id",
		"PASSWORD"		=> "company.pwd",
		"NAME"			=> "company.name",
		"INFOMATION"	=> "company.info",
		"USER"			=> "company.user",
		"IMG"			=> "company.img",
	);

	$FACTORY = array(
		"TABLE"			=> "factory",
		"ALL"			=> "factory.*",
		"ID"			=> "factory.factory_id",
		"ADDRESS"		=> "factory.addr",
		"TELPHONE"		=> "factory.tel",
		"NAME"			=> "factory.name",
		"EXPEXTWORKTIME"=> "factory.expected_work_time",
		"COMPANYID"		=> "factory.company_id",
	);
?>