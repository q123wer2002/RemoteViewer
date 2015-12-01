<?php
/*
設定網路模式、socket類型和通訊協定

網路模式分為三種：
AF_INET：一般IPv4網路
AF_INET6：IPv6網路
AF_UNIX：需要Server及Client端都在同一台主機互連才需要

socket類型常用的四種：
SOCK_STREAM：最常使用的類型，使用TCP傳輸
SOCK_DGRAM：UDP傳輸
SOCK_SEQPACKET：該類型必需完整的把封包接收完畢才可以讀取
SOCK_RAW：ICMP傳輸

通訊協定則分為：SOL_ICMP、SOL_UDP、SOL_TCP

*/
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);

//設定Server IP及1234 port
socket_bind($socket, 'localhost', 8000);

//啟動socket
socket_listen($socket);

//接收Client連線
$connection = socket_accept($socket);
if($connection)
{
    //將資料寫入到socket暫存
    socket_write($connection,"test");
    echo "Connect";
}
?>