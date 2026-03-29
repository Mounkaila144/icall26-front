#!/bin/bash
AUTH="Bearer 425|UBMp7iztgRfKNW7QtByXS3rQ9Lre2eQmMTsJZlCJ7d8c2b46"
BASE="http://tenant1.local/api/admin/customersmeetings/meetings"

get_total() {
  curl -s "$BASE?per_page=1&lang=en&$1" -H "Authorization: $AUTH" -H "Accept: application/json" | grep -o '"total":[0-9]*' | head -1 | cut -d: -f2
}

echo "=== BASELINE ==="
echo "No filter: total=$(get_total '')"

echo ""
echo "=== TEXT SEARCH FILTERS ==="
echo "search_lastname=FOO: total=$(get_total 'search_lastname=FOO')"
echo "search_lastname=ABC: total=$(get_total 'search_lastname=ABC')"
echo "search_phone=0649604302: total=$(get_total 'search_phone=0649604302')"
echo "postcode=75017: total=$(get_total 'postcode=75017')"
echo "postcode=76000: total=$(get_total 'postcode=76000')"
echo "search_city=PARIS: total=$(get_total 'search_city=PARIS')"
echo "search_city=ROUEN: total=$(get_total 'search_city=ROUEN')"

echo ""
echo "=== BOOLEAN FILTERS ==="
echo "is_confirmed=YES: total=$(get_total 'is_confirmed=YES')"
echo "is_confirmed=NO: total=$(get_total 'is_confirmed=NO')"
echo "is_hold=YES: total=$(get_total 'is_hold=YES')"
echo "is_hold=NO: total=$(get_total 'is_hold=NO')"
echo "is_hold_quote=YES: total=$(get_total 'is_hold_quote=YES')"
echo "is_hold_quote=NO: total=$(get_total 'is_hold_quote=NO')"
echo "is_qualified=YES: total=$(get_total 'is_qualified=YES')"
echo "is_qualified=NO: total=$(get_total 'is_qualified=NO')"

echo ""
echo "=== STATUS FILTER ==="
echo "status=ACTIVE: total=$(get_total 'status=ACTIVE')"
echo "status=DELETE: total=$(get_total 'status=DELETE')"

echo ""
echo "=== ENTITY ID FILTERS ==="
echo "telepro_id=2104: total=$(get_total 'telepro_id=2104')"
echo "sales_id=2104: total=$(get_total 'sales_id=2104')"
echo "created_by_id=2104: total=$(get_total 'created_by_id=2104')"
echo "callcenter_id=1: total=$(get_total 'callcenter_id=1')"
echo "company_id=1: total=$(get_total 'company_id=1')"
echo "campaign_id=1: total=$(get_total 'campaign_id=1')"
echo "type_id=1: total=$(get_total 'type_id=1')"
echo "partner_layer_id=1: total=$(get_total 'partner_layer_id=1')"
echo "polluter_id=106: total=$(get_total 'polluter_id=106')"
echo "confirmator_id=2104: total=$(get_total 'confirmator_id=2104')"
echo "confirmed_by_id=2104: total=$(get_total 'confirmed_by_id=2104')"

echo ""
echo "=== STATUS ID FILTERS ==="
echo "state_id=63: total=$(get_total 'state_id=63')"
echo "status_call_id=1: total=$(get_total 'status_call_id=1')"
echo "status_lead_id=1: total=$(get_total 'status_lead_id=1')"

echo ""
echo "=== RANGE FILTERS ==="
echo "opc_range_id=1: total=$(get_total 'opc_range_id=1')"
echo "in_at_range_id=1: total=$(get_total 'in_at_range_id=1')"

echo ""
echo "=== DATE FILTERS ==="
echo "date_from=2024-07-01&date_to=2024-07-31: total=$(get_total 'date_from=2024-07-01&date_to=2024-07-31')"
echo "date_from=2024-07-01&date_to=2024-07-31&date_type=in_at: total=$(get_total 'date_from=2024-07-01&date_to=2024-07-31&date_type=in_at')"
echo "date_from=2024-07-01&date_to=2024-07-31&date_type=creation_at: total=$(get_total 'date_from=2024-07-01&date_to=2024-07-31&date_type=creation_at')"

echo ""
echo "=== NULLABLE FILTERS ==="
echo "state_id=IS_NULL: total=$(get_total 'state_id=IS_NULL')"
echo "partner_layer_id=IS_NULL: total=$(get_total 'partner_layer_id=IS_NULL')"
echo "polluter_id=IS_NULL: total=$(get_total 'polluter_id=IS_NULL')"

echo ""
echo "=== DONE ==="
