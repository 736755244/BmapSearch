  //选址
        self.OpenMap = function () {
            $("#ppmap").show();
            var map = new BMap.Map("MapAddress");
            map.setDefaultCursor("crosshair");
            var rp, address, lat, lng;
            if (self.model().basicinfo.Latitude() && self.model().basicinfo.Longitude()) {
                rp = new BMap.Point(self.model().basicinfo.Longitude(), self.model().basicinfo.Latitude());
                var mk = new BMap.Marker(rp);
                map.addOverlay(mk);
            } else {
                rp = new BMap.Point(121.47824, 31.235188);
            }
            map.centerAndZoom(rp, 11);
            //定位当前地址
            //var geolocation = new BMap.Geolocation();
            //geolocation.getCurrentPosition(function (r) {
            //    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            //        curcity = r.address.city.replace('市', '');
            //        map.centerAndZoom(r.point, 11);
            //        map.setCurrentCity(curcity);
            //    }
            //    else {
            //        console.log('failed' + this.getStatus());
            //        self.unblockUI();
            //    }
            //}, { enableHighAccuracy: true })
            //点击事件
            map.enableScrollWheelZoom(true);//允许缩放
            map.addEventListener("click", function (e) {
                map.clearOverlays();  // 清除地图覆盖物
                var geocoder = new BMap.Geocoder();
                var point = new BMap.Point(e.point.lng, e.point.lat);
                var marker = new BMap.Marker(point);  // 创建标注
                map.addOverlay(marker);              // 将标注添加到地图中
                geocoder.getLocation(point, function (geocoderResult, LocationOptions) {
                    var adinfo = geocoderResult.addressComponents;
                    //省市区街道、地址
                    //province city district street streetNumber==>address
                    address = geocoderResult.address;
                    lat = geocoderResult.point.lat;
                    lng = geocoderResult.point.lng;
                });
            });

            self.SaveAddres = function () {
                self.model().basicinfo.AddressCN(address);
                self.model().basicinfo.Latitude(lat);
                self.model().basicinfo.Longitude(lng);
                $("#ppmap").hide();
            }
            //搜索(点击事件)
            function G(id) {
                return document.getElementById(id);
            }
            var ac = new BMap.Autocomplete({
                "input": "keyword",
                "location": map
            });
            var myValue;
            ac.addEventListener("onconfirm", function (e) {
                var _value = e.item.value;
                myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                G("address").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
                setPlace();
            });

            function setPlace() {
                map.clearOverlays();
                function myFun() {
                    var pp = local.getResults().getPoi(0).point;
                    map.centerAndZoom(pp, 18);
                    map.addOverlay(new BMap.Marker(pp));
                }
                var local = new BMap.LocalSearch(map, {
                    onSearchComplete: myFun
                });
                local.search(myValue);
            }

            //搜索(回车事件)
            $('#suggestId').bind('keydown', function (event) {
                if (event.keyCode == "13") {
                    map.clearOverlays();  // 清除地图覆盖物
                    var value = $("#suggestId").val();
                    var url = "http://restapi.amap.com/v3/geocode/geo?key=0d099b2bbf660181d15211d759ae5911&address=" + value;
                    //发送请求API接口--获取当前地址对应的坐标
                    var request = new XMLHttpRequest();
                    request.onload = function () {
                        if (request.status == 200) {
                            var result = JSON.parse(request.responseText);
                            var lat = result.geocodes[0].location.split(",")[1];//纬度
                            var lng = result.geocodes[0].location.split(",")[0];//经度
                            //添加标记点
                            map.addOverlay(new BMap.Marker(new BMap.Point(lng, lat)));
                            //设置当前点为中心点
                            map.centerAndZoom(new BMap.Point(lng, lat), 18);

                        } else {
                            self.addTip(PMTLang.NewProject.MapError, Utils.tipType.warning);
                        }
                    };
                    request.open("get", url);
                    request.send(null);
                }
            });

        }