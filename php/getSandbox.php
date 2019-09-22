<?php
header("Cache-Control: no-cache, no-stire, must-revalidate, max-age=0");
header('Content-Type: application/json; charset=utf-8');
session_name( 'SWViewer' );
session_start();
if ((isset($_SESSION['tokenKey']) == false) or (isset($_SESSION['tokenSecret']) == false) or (isset($_SESSION['userName']) == false)) {
    echo "Invalid request";
    session_write_close();
    exit(0);
}
session_write_close();

$url = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q3938&props=sitelinks/urls&format=json&utf8=1";
echo file_get_contents($url);
?>