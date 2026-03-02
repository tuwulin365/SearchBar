var defaultsettings={
  "pinned":false,
  "showontextselection":false,
  "showonsessionstartup":false,
  "showingremember":false,
  "highlightingremember":true,
  "escfromanywhere":true,
  "displaycross":true,
  "displayhighlightbutton":true,
  "displayfindbuttons":true,
  "maximumnumberoffindbuttons":5,
  "sendsearchsuggestions":true,
  "searchsuggestionslocale":".com",
  "maximumnumberofsearchsuggestions":10,
  "maximumnumberofsearchhistorysuggestions":10,
  "disablesearchhistory":false,
  "displayoptionspagelink":true,
  "hotkeys":{
    "show":[115,false,false,false,false],
    "hide":[27,false,false,false,false],
    "highlight":[72,true,true,false,false]
  },
  "custombuttons":[
    [true,false,[[71,true,false,false,false],[71,true,true,false,false],[71,true,true,true,false]],"Google (Alt+G)","https://www.google.com/","https://www.google.com/search?q=%s"],
    [true,false,[[89,true,false,false,false],[89,true,true,false,false],[89,true,true,true,false]],"YouTube (Alt+Y)","https://www.youtube.com/","https://www.youtube.com/results?search_query=%s"],
    [true,false,[[87,true,false,false,false],[87,true,true,false,false],[87,true,true,true,false]],"Wikipedia (Alt+W)","https://en.wikipedia.org/","https://en.wikipedia.org/w/index.php?search=%s&title=Special%3ASearch"],
    [true,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"ChatGPT","https://chatgpt.com/","https://chatgpt.com/?q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Wolfram|Alpha","https://www.wolframalpha.com/","https://www.wolframalpha.com/input/?i=%s"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Google Translate","https://translate.google.com/","https://translate.google.com/#auto/en/%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"search current site","https://www.google.com/","https://www.google.com/search?q=%s%20site%3A%h"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Google Images","https://images.google.com/","https://www.google.com/search?tbm=isch&q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Google Maps","https://maps.google.com/","https://maps.google.com/maps?q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Google News","https://news.google.com/","https://www.google.com/search?tbm=nws&q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Gmail","https://mail.google.com/","https://mail.google.com/mail#search/%s"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Wiktionary","https://en.wiktionary.org/","https://www.wikipedia.org/search-redirect.php?family=wiktionary&search=%s&language=en"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Urban Dictionary","https://www.urbandictionary.com/","https://www.urbandictionary.com/define.php?term=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Thesaurus.com","http://thesaurus.com/","http://thesaurus.com/browse/%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Rotten Tomatoes","https://www.rottentomatoes.com/","https://www.rottentomatoes.com/search/?search=%s"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"eBay","https://www.ebay.com/","https://www.ebay.com/sch/i.html?_nkw=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Amazon","https://www.amazon.com/","https://www.amazon.com/s/?field-keywords=%s"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Twitter","https://twitter.com","https://twitter.com/search?q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"tweet current page","https://twitter.com/intent/tweet?url=%u","https://twitter.com/intent/tweet?text=%s&url=%u"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"go to web address","","%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"cache of current page","https://webcache.googleusercontent.com/search?q=cache:%u","https://webcache.googleusercontent.com/search?q=cache:%u+%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"WHOIS lookup of current website","https://whois.domaintools.com/%h","https://whois.domaintools.com/%h"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Internet Archive for current page","https://web.archive.org/web/*/%u","https://web.archive.org/web/*/%u"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"go up","%{u.replace(/\\/$/,\"\").replace(/\\/[^\\/]*$/,\"\").replace(/^[a-z-]*:\\/$/,u)}","%{u.replace(/\\/$/,\"\").replace(/\\/[^\\/]*$/,\"\").replace(/^[a-z-]*:\\/$/,u)}"],
    [false,true,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Incognito Google","i:https://www.google.com","i:https://www.google.com/search?q=%s"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"copy selection","javascript:document.execCommand(\"copy\")","javascript:document.execCommand(\"copy\")"],
    [false,false,[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"Chrome Web Store","https://chrome.google.com/webstore/","https://chrome.google.com/webstore/search/%{encodeURIComponent(s)}"]
  ],
  "i1":"https://www.google.com/favicon.ico",
  "i2":"https://www.youtube.com/favicon.ico",
  "i3":"https://en.wikipedia.org/static/favicon/wikipedia.ico",
  "i4":"https://cdn.oaistatic.com/assets/favicon-o20kmmos.svg",
  "i5":"https://www.wolframalpha.com/favicon.ico",
  "i6":"https://translate.google.com/favicon.ico",
  "i7":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7DAAAOwwHHb6hkAAACcElEQVQ4jZWS30tTYRjH9zd0o5EGatR01ObQsVw6pzsza62cEzVtLUOEqFU6s2aemRW22FaRyGo0EkOiNscC+wGZVKM1dacVFEvaRbCgbgRpF4Kwb3tfmDgOQV18Xw4vz/t5vud5voLioFZAtLKygjH3HciVdaiqrYe2yQCRtBJW2yV6//LVHLK1G0WPZPIHGK0OlvNWhBZiiHz7BcuFQRxu2YGxvjy4+vPR2SbCqV4LD0KP5rYO3Lo9jvEZDubgdxwZuomh02L8Ts4inU5T/YyY0GMqo25yAIHgE5TLFWD266hlIlmNCkmuDxzHUWUh4ck86jQHYOruQaOwHL7243jK2vF1YBRXlVq88esgEAioyONUKoX3jwppgxwAGZrP0E2LlpeXwbIs7htPIDEtg1qthtlsxtraGuZmA+CmNvEdGEulWJp9SwHkMekokUgQ02/G5xcViL5z4PWzXsQe58NkEPJncLR0F5buPaQA8r8EcmPUjudbpWhvEsPJFsF+bhtaD+6k9sm6cwDE0rxEhfjHT1hdXUUikcBERQPMRWLUGjrQ0tUDKzuMM5ZBkHnx1jjxYAp6WRU+NHchVt+KsFCG64XbIc9swuWdxGKUg983jYu2KzRkX+Jx8HJAIMSeXncITHUNlJpGhMLz8AdmYBlg0Wk8Bo/HA4fTBaW6ISeV6yRCJhbV+w7g5Nn+TBKHsVdnoF0JvEwkgtPppKDqemZ9mLxsExDpQFxFFhZpEQmbUCxFcUkJLo+MwOv1QpMJ3jWHEzzA35SFbCkogC2zqVA4it0Zd/8M2AhhGA3c7rtQqNT/B8hCKhU12FPHgHz/AcaQDZ9dh2YlAAAAAElFTkSuQmCC",
  "i8":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7DAAAOwwHHb6hkAAACQUlEQVQ4jaWTXUhTYRzGz9zp06mRZpYVtdboy7Ux+oKISunTCzFqRBR5kRAsvXQledFAV3rs+7TaJIez1syP4W6W3czAJlmIuxDKm5DoRgkGVh63/9N7zqGLsYKyi985h3P4Pf9z3uc9nD5Uzv0Pv71p7iFsDxI2PyMYOgjrnxDWeAh/FSDLJV2ELQGC0c8kH2FdG2H1I0KhmBmiHKx9BEsvYUc3m8zkykgSd8dm0TXxQ6EhJsHqT6HgPmHZbYKuhbDIpYZxsmR6oU7d9pxQPyyhZWACpjMu8JbL0O68ioN1IbSPJXCiO4mcVoJzMIn4FwkLmwicLG0NqN97NJyCOPQZuXtrwJvt0FpqkbWnAZoDIowX++GNf8OKOwSzJ4XqcFINMHYSNvnVxXIMSSit9Sqi1lKDrH3N0BzyQFvmQXZFH4ToNMrck4r4C05epA3t6kq73kkoOS9Cu6seGiZzh4PgjvczQsg/+wr2p59ga/uQHrDWyypiFLOamkYk7LYHwO8X2NTHqlweAV8RQcG5KJyRqcyAIjdBZuVDgi08h8YIe8UjPhTagtCdDEN3agBFF6Kw1o3CF5/Bxitv0wPkavLvEZYzilnPre9n4eiZhL46Ct3pl0x+jVLnOITBr7B3jGLBten0gDzWa94tQi6rJ0cgZZWvv5FYbTN4EEtAHE6gc/w7qtwx8JdG0mQ14CZhaTNhCTsvvqFuEPmBQZiCyfVRYZUjnjFZJruRBRiOVUEvzs0L2VW2snwxH/74N/4LPwH4nz84wgMhgAAAAABJRU5ErkJggg==",
  "i9":"https://www.google.com/images/branding/product/ico/maps_32dp.ico",
  "i10":"https://ssl.gstatic.com/news/img/favicon.ico",
  "i11":"https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
  "i12":"https://www.wiktionary.org/static/favicon/piece.ico",
  "i13":"https://www.google.com/s2/favicons?domain=www.urbandictionary.com",
  "i14":"https://www.google.com/s2/favicons?domain=www.thesaurus.com",
  "i15":"https://www.rottentomatoes.com/assets/pizza-pie/images/favicon.ico",
  "i16":"https://www.ebay.com/favicon.ico",
  "i17":"https://www.amazon.com/favicon.ico",
  "i18":"https://twitter.com/favicon.ico",
  "i19":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAlwAAAJcB1AYsggAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFKSURBVDiNnZK9TgJBFIW/2V1EtoIYtUBiSaSwEI2tnTE+g53wDBY2PoONdm5iYzSWxsTCzlpNLNaoURcTC6IIMcD+zFiAhM0uETzdzD33nHPvjJg9+FqXQuwDWUZDRaHKImfVHWBmxOYulKP9vxlA5LRhaIYAMajWfyhO6jzVJZ9t1bvbyCfYLiZpBXD04HFdDTh78Xv1UIKVrMHpmsnytA6AaQh2lsZJGYJMUlAqjGEa4SyhBFfvPqVCguNVE7smsWsSo8+i6StOHr3BAnMZnVTXIZ/WyKfDK3puyMgOQozDe5cLx0dFaB30zx4r4AZwUw1iN/72LbFsL3Ifeca9OxfL9kIpqi3F5mWThhvNFtrB4pTO1kKS+Qkd0XU9f/XZvXX5aMcPJnJWPVIRQELvjPQXYn+iYrjmX4HKcNRYK0dTqPL/RJSjJOUfYbNxXqpmL24AAAAASUVORK5CYII=",
  "i20":"data:image/gif;base64,R0lGODlhEAAQAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAAQABAAAAIrlI95wM1qQJj0KUmnBDfrlmCeFo5VaQYcIo7rkqqo+UZxLbQe7vQWBAwGCwA7",
  "i21":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAABHklEQVQ4jc3SvS5EURDA8R8W2Y2rkRAfBTqJELshUW6yjSDRaSg1Gh5A4QG8gER0ttSoJEpR0HkDiQcQ17fYq3A2bq5LIlGY5szMmfnPxzn8R2nN2Eu/CW76akEvYvwnQFuOr4GJkDyBY9yGu34sogdXaUA3pjGLBOdYQBfOMIa1ADjEDTrwVAiAW5yigM0ALuEhdDKPHTyH+Lu88UexhZUoii4qlUpSLpdfsI9q2MuXpJZwrmIIuxjEJURRJI7jI9QRhxHecICXNKga2oe5OkntYxen2MZMqmAfhrOdTKX0rj5OsId1DGAjE1/MAkoZuz3MuxyqTqI3m8TnM75m/I0A7cC1j2cr4DEP8p2MoDNl5/3a3J/YlAT3Gfvv5R2UfjKXyjiL3AAAAABJRU5ErkJggg==",
  "i22":"https://whois.domaintools.com/favicon.png",
  "i23":"https://archive.org/images/glogo.jpg",
  "i24":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABJ0AAASdAHeZh94AAAAB3RJTUUH4gUIAxYN+mPAhQAAArlJREFUOMt9k01oXFUUx3/nvvtm3pj5yKRJJoVQghWhQrqxuCm4Uyy0225E0Y0EpCsXBaHoqotS6MJlhboSBHGhpdLWhYquxC9E2pAax7ZmkqZjMtOZeW/eu/eeLiaNKz3r//mdc/7nHAEsrZfLVy6+MdjpbmMiS/CO5uwcb77zUZWtG2P+JwSYuvb55cHyM2Omp6uoD4g17O4M+WUt5tTKe1N0Ovl/Ai5dOqfHmlc4dNDhjQFVRMBoYK3tuDU+y5kz12pwv2BpUQCwFYU1uHPHy7n3z+r0UwMAgtp9shEQgf4wYa61QFKOiIwigCsyZucPsrLy+pSdadQ59WKFenMGlXkgBgQNYyxdIh2Qj/5Cx+uIf4AWPTRts92vcv78haE14plv5lRnC0DBRBNrPKTDAvFKI7HggMJD7iBNCd7QWb2HVYWiUNjLJ1IQ6PYdn3T6GJNzuuaZMQoe1EUEH+GCJSkl2P1lKKBjCJ5+avist87vzd/wCFq0eNUn1CVMZDqRA3sABUKBhj6DccSXacpPyY9schtVTxov0QzLnPQDKmH932x5Agg5+IdkWcyn2yW+yn5lY+c7stoIb5TusMvVWoPMHuF0aYOK+L0TAgseinuQpwTn6Kz2uP39Q/4IOfJKhIrA9cBIbvHc8S3CkQzBTNqWJwDXgXxEpRDeXvacOBDz2s0mq1sZAM8mZT58SXh6sU8lQMBM6itYUUccdiEMMBgaVeVwS0mSCPIYRUkqEYcXUupVA6McvCO2fjLCaDzk741N6rs9XDCULGz2Y/JQx5iJX4V3/Hn3EQu7BYWDWEs86CWkaYqdWzjKtxuHEKMoUDKWXvqINHyMMf8ASqoH+ObuWzTKNXJxiIBqRGuxjgBlOAFL6cTW9n1lhvLJd4/2fqj/DKq8MHqeLz5oT7Pey/YfCqD9tT4Gh7NNzlHgMwYAAAAASUVORK5CYII=",
  "i25":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAALGSURBVDhPjVNLTxNhFD19l1JKIkIggUKoVGkIjwDl2RieGxIeIQoajAR/gmwUjcQEMNG9BmSraNREXZAYVrATVpDYskHahJayINApnXam7XjvJ8SdepNpvt757rnnnnNHt76+rq2uriKdTuNPaNA0QKejEx0ymazIGgwGylGSwmQyYXh4CIb8fMfs6ekJksmkeBIJGZIkQZYTiMfjAthmsyE3NxfHx8f0PoFUiu+dif9GRVGgqqpAzWazMJstmLw7iUsFBeB3drsdRUVFovPCwjzC4bDozsHgev65AJGkOHNGY1MTPB4PamtrUVFRgZycHAHA7FKpFFRFFTUCQOVies6IbmHhZfT09IjZeRxxmYAzmQwxM8PpLBM5Ho9r0ioBKKoCKS7BWV6Oubl5DI+MIBaTREfufNGdqU9N3cP96WkYjUbISRlqWiENCDEpy0Jth8MhBNrc/I69vT1YLVayAgQYQ0lJCQYGBuDr9GHl7RuEdw7EKIYrrspZFi8cPkDk8BDV1R7U1NTA5XIhjwCLi4vR1tYGn++6cCPg92Nza4ss1cNkNkHX29utmUnVBw9nBDWmm5fnQDC4T9bZ6WwXiodCIexsb6PT50NdXT0eP5oh0WPQZzNp7O//xOulRVRVuYlBNYlZCL//B8ZujuLOxG0EAgG8f7eC3d0AvF4vvn75jLW1b0JsXUd7q3Z0FEVzsxe9fX0YHBwSu5Ah4I2NDUG7paVVqM9OhIJBTEzcIpdkNDQ0Qs803O6rePlqEV1d3Tg5ORULxer19/ejvb1DWMnj6fU8t5lGs/22mFzQJ5MJjI2PCwdKS8vIayesVquwj0G4iFlwjkHcbjdGR28IZ3gPjHwhGo3i08cPUM5X+m9hsVjEt2KgOt5G3TV3pRaJRMRasgP/Ct4Xts9COtXV10O3vLykvXj+jGZSzq/8X/CIT2af4hdol1iqZLCpuAAAAABJRU5ErkJggg==",
  "i26":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAJ2AAACdgBx6C5rQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACVSURBVDiN3dOxDQIxDAXQx8EIQEvJEjAEBbceEuUhWIMRoGMHGACKu6ArkogoHV+K8mX5f9lOTCUmI75Di2kit40FmxE/YlVTzRv7UlETiS1xHwxj54ZFSJ5FDDZYS/SMDltcUgZhiKdM5d9Bx1oowp8ZtLiWGoxfITf1nwwCXsPdZXTPQGKL89Av2TwhPuOg/5X1+AD/qBWhDBwnPwAAAABJRU5ErkJggg==",
  "i27":"https://www.google.com/images/icons/product/chrome_web_store-32.png",
  "detect":true,
  "detectprimary":true,
  "detectcustom":[],
  "detecttosearchhistory":false,
  "alwaysnewtab":false,
  "alwaysforegroundtab":false,
  "showontextselectionexception":true,
  "position":["top","left"],
  "separatorsaslinebreaks":false,
  "findbuttonhotkeys":[[[49,true,true,false,false],[49,true,true,true,false]],[[50,true,true,false,false],[50,true,true,true,false]],[[51,true,true,false,false],[51,true,true,true,false]],[[52,true,true,false,false],[52,true,true,true,false]],[[53,true,true,false,false],[53,true,true,true,false]]],
  "direction":"initial",
  "removewhitespace":true,
  "forcepopup":false,
  "extrapixels":0,
  "extraboxpixels":0,
  "imageproxy":true,
  "searchremember":true,
  "bonussettingsactivated":false,
  "searchbarbackgroundcolour":"#e0e0e0",
  "buttonbackgrounddefault":true,
  "buttonbackgroundcolour":"#f0f0f0",
  "showhideallatonce":false,
  "disablehostnames":[],
  "displayboxclear":false,
  "_searchhistory":[],
  "_height":36,
};
chrome.storage.local.get(null,function(settings){
  var newsettings={};
  var changedsettings=false;
  if(typeof(settings.custombuttons)=="undefined"){
    newsettings=defaultsettings;
    changedsettings=true;
  }
  else{
    for(var setting in defaultsettings){
      if(defaultsettings.hasOwnProperty(setting)&&typeof(settings[setting])=="undefined"&&(!(setting.charAt(0)=="i"&&parseInt(setting.substring(1),10)>0))){
        newsettings[setting]=defaultsettings[setting];
        changedsettings=true;
      }
    }
    if(typeof(settings.hotkeys)!="undefined"){
      var hotkeysettings=["show","hide","highlight"];
      for(var i=0;i<hotkeysettings.length;i++){
        if(settings.hotkeys[hotkeysettings[i]].length==4){
          if(typeof(newsettings.hotkeys)=="undefined"){
            newsettings.hotkeys=settings.hotkeys;
          }
          newsettings.hotkeys[hotkeysettings[i]].push(false);
          changedsettings=true;
        }
      }
    }
    for(var i=0;i<settings.custombuttons.length;i++){
      for(var j=0;j<settings.custombuttons[i][2].length;j++){
        if(settings.custombuttons[i][2][j].length==4){
          if(typeof(newsettings.custombuttons)=="undefined"){
            newsettings.custombuttons=settings.custombuttons;
          }
          newsettings.custombuttons[i][2][j].push(false);
          changedsettings=true;
        }
      }
    }
    if(typeof(settings.findbuttonhotkeys)!="undefined"){
      for(var i=0;i<settings.findbuttonhotkeys.length;i++){
        for(var j=0;j<2;j++){
          if(settings.findbuttonhotkeys[i][j].length==4){
            if(typeof(newsettings.findbuttonhotkeys)=="undefined"){
              newsettings.findbuttonhotkeys=settings.findbuttonhotkeys;
            }
            newsettings.findbuttonhotkeys[i][j].push(false);
            changedsettings=true;
          }
        }
      }
    }
  }
  if(changedsettings){
    chrome.storage.local.set(newsettings);
  }
});
var tabs=[];
var searchesbytabid=[];
var lastsearch="";
var lasthighlighting="";
var lastshowing="";
var imagesrccache={};
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message=="start"){
    chrome.storage.local.get("_height",function(settings){
      sendResponse({
        "lastshowing":lastshowing,
        "height":settings._height
      });
    });
    return true;
  }
});
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message=="defaultsettings"){
    sendResponse(defaultsettings);
  }
});
chrome.runtime.onConnect.addListener(function(port){
  if(typeof(port.sender.tab)=="undefined"){
    port.sender.tab={
      "id":"popup"
    };
  }
  if(typeof(tabs[port.sender.tab.id])=="undefined"){
    tabs[port.sender.tab.id]={
      "frameports":[]
    };
  }
  var tab=tabs[port.sender.tab.id];
  if(port.name=="top"){
    tab.topport=port;
    tab.topportlistener=function(message){
      if(message.type=="init"){
        chrome.storage.local.get("_height",function(settings){
          port.postMessage({
            "type":"init",
            "lastsearch":typeof(searchesbytabid[port.sender.tab.id])=="undefined"?[lastsearch,true]:[searchesbytabid[port.sender.tab.id],false],
            "lastshowing":lastshowing,
            "lasthighlighting":lasthighlighting,
            "height":settings._height
          });
          delete searchesbytabid[port.sender.tab.id];
        });
      }
      else if(message.type=="search"){
        tab.topportlistener({
          "type":"lastsearch",
          "data":message.lastsearch
        });
        if(message.data[0].search(/(https?:\/\/|javascript:|data:|chrome-extension:)/)==0||(message.data[0].search(/chrome:/)==0&&chrome.extension.inIncognitoContext==false&&message.data[4]==false)){
          if(message.disablesearchhistory==false&&message.data[4]==false){
            tab.topportlistener({
              "type":"searchhistory",
              "data":message.lastsearch[0]
            });
          }
          var updatesearchesbytabid=function(othertab){
            if(typeof(othertab)!="undefined"){
              searchesbytabid[othertab.id]=message.lastsearch[0];
            }
          };
          if(message.data[0].search(/javascript:/)==0){
            var command=null;
            var commandmatch=message.data[0].match(/\s*javascript:\s*document\s*\.\s*execCommand\s*\(\s*("[a-zA-Z]*"|'[a-zA-Z]*')\s*\)\s*/);
            if(commandmatch!==null){
              command=commandmatch[1].substring(1,commandmatch[1].length-1);
            }
            var runcommand=function(command){
              if(command!==null){
                document.execCommand(command);
              }
              else{
                alert("Most \"javascript:\" URLs are no longer supported by SearchBar because of security restrictions on Chrome Extensions imposed by Manifest V3. Please see the SearchBar FAQ for more information.");
              }
            };
            if(message.data[3]){
              chrome.tabs.query({"active":true,"lastFocusedWindow":true},function(activetabs){
                chrome.scripting.executeScript({
                  "target":{"tabId":activetabs[0].id},
                  "func":runcommand,
                  "args":[command]
                });
                if(activetabs.length>0){
                  updatesearchesbytabid(activetabs[0]);
                }
              });
              port.postMessage({
                "type":"closepopup"
              });
            }
            else{
              chrome.scripting.executeScript({
                "target":{"tabId":port.sender.tab.id},
                "func":runcommand,
                "args":[command]
              });
              chrome.tabs.get(port.sender.tab.id,updatesearchesbytabid);
            }
          }
          else{
            if(message.data[4]&&chrome.extension.inIncognitoContext==false){
              if(message.data[3]){
                var getlastwindowstate=function(callback){
                  chrome.tabs.query({"active":true,"lastFocusedWindow":true},function(activetabs){
                    if(activetabs.length>0){
                      chrome.windows.get(activetabs[0].windowId,function(lastwindow){
                        callback(lastwindow.state);
                      });
                    }
                    else{
                      chrome.windows.getLastFocused(function(lastwindow){
                        callback(lastwindow.state);
                      });
                    }
                  });
                };
              }
              else{
                var getlastwindowstate=function(callback){
                  chrome.windows.get(port.sender.tab.windowId,function(lastwindow){
                    callback(lastwindow.state);
                  });
                };
              }
              getlastwindowstate(function(lastwindowstate){
                chrome.windows.create({
                  "url":message.data[0],
                  "incognito":true,
                  "state":lastwindowstate
                });
              });
            }
            else{
              if(message.data[1]){
                if(message.data[3]){
                  chrome.tabs.query({"active":true,"lastFocusedWindow":true},function(activetabs){
                    chrome.tabs.create(activetabs.length>0?{
                      "url":message.data[0],
                      "active":message.data[2],
                      "openerTabId":activetabs[0].id
                    }:{
                      "url":message.data[0],
                      "active":message.data[2]
                    },
                    updatesearchesbytabid);
                  });
                }
                else{
                  chrome.tabs.create({
                    "url":message.data[0],
                    "active":message.data[2],
                    "openerTabId":port.sender.tab.id
                  },
                  updatesearchesbytabid);
                }
              }
              else{
                if(message.data[3]){
                  chrome.tabs.update({
                    "url":message.data[0]
                  },
                  updatesearchesbytabid);
                  port.postMessage({
                    "type":"closepopup"
                  });
                }
                else{
                  chrome.tabs.update(port.sender.tab.id,{
                    "url":message.data[0]
                  },
                  updatesearchesbytabid);
                }
              }
            }
          }
        }
      }
      else if(message.type=="lastsearch"){
        lastshowing=message.data[1];
        lastsearch=message.data[0];
        lasthighlighting=message.data[2];
      }
      else if(message.type=="searchhistory"&&chrome.extension.inIncognitoContext==false&&message.data!=""){
        chrome.storage.local.get("_searchhistory",function(settings){
          if(settings._searchhistory.length==0||settings._searchhistory[0]!=message.data){
            settings._searchhistory.unshift(message.data);
            chrome.storage.local.set({"_searchhistory":settings._searchhistory});
          }
        });
      }
      else if(message.type=="getsuggestions"){
        chrome.storage.local.get("_searchhistory",function(settings){
          port.postMessage({
            "type":"getsearchhistory",
            "data":settings._searchhistory,
          });
          if(message.data!==false){
            fetch(message.data).then(function(response){
              if(response.status==200||response.status==304){
                response.text().then(function(responseText){
                  port.postMessage({
                    "type":"getsearchsuggestions",
                    "data":JSON.parse(responseText.substring(responseText.indexOf("(")+1,responseText.lastIndexOf(")")))
                  });
                });
              }
            });
          }
        });
      }
      else if(message.type=="focus"||message.type=="find"){
        if(typeof(tab.frameports[message.frameid])!="undefined"){
          tab.frameports[message.frameid].postMessage({
            "type":message.type,
            "data":message.data
          });
        }
      }
      else if(message.type=="highlight"||message.type=="unhighlight"){
        for(i in tab.frameports){
          tab.frameports[i].postMessage({
            "type":message.type,
            "data":message.data
          });
        }
      }
      else if(message.type=="custombutton"){
        chrome.storage.local.get("custombuttons",function(settings){
          settings.custombuttons[settings.custombuttons.length]=message.custombutton;
          chrome.storage.local.set(JSON.parse("{\"custombuttons\":"+JSON.stringify(settings.custombuttons)+",\"i"+settings.custombuttons.length.toString()+"\":\""+message.i+"\"}"));
        });
      }
      else if(message.type=="height"){
        chrome.storage.local.set({"_height":message.data.toString()});
      }
      else if(message.type=="url"){
        chrome.tabs.create(message.popup?{
          "url":message.url
        }:
        {
          "url":message.url,
          "openerTabId":port.sender.tab.id
        });
      }
      else if(message.type=="showallatonce"||message.type=="hideallatonce"){
        chrome.tabs.query({"active":true,"lastFocusedWindow":true},function(activetabs){
          if(activetabs.length>0&&activetabs[0].id==port.sender.tab.id){
            for(var othertabid in tabs){
              if(othertabid!=port.sender.tab.id&&typeof(tabs[othertabid])!="undefined"&&typeof(tabs[othertabid]).topport!="undefined"){
                tabs[othertabid].topport.postMessage({
                  "type":message.type
                });
              }
            }
          }
        });
      }
      else if(message.type=="imagesrc"){
        if(imagesrccache.hasOwnProperty(message.data)){
          port.postMessage({
            "type":message.type,
            "data":imagesrccache[message.data],
            "buttonid":message.buttonid
          });
        }
        else{
          fetch(message.data).then(function(response){
            if(response.status==200||response.status==304){
              response.blob().then(function(responseBlob){
                var reader=new FileReader();
                reader.onload=function(event){
                  imagesrccache[message.data]=event.target.result;
                  port.postMessage({
                    "type":message.type,
                    "data":event.target.result,
                    "buttonid":message.buttonid
                  });
                }
                reader.readAsDataURL(responseBlob);
              });
            }
            else{
              port.postMessage({
                "type":message.type,
                "data":"",
                "buttonid":message.buttonid
              });
            }
          });
        }
      }
    };
    port.onMessage.addListener(tab.topportlistener);
    port.onDisconnect.addListener(function(){
      delete tabs[port.sender.tab.id];
    });
  }
  else if(port.name=="frame"){
    port.frameid=tab.frameports.length;
    tab.frameports.push(port);
    port.onMessage.addListener(function(message){
      if(message.type=="event"){
        if(typeof(tab)!="undefined"&&typeof(tab).topport!="undefined"){
          tab.topport.postMessage({
            "type":"event",
            "frameid":port.frameid,
            "data":message.data
          });
        }
      }
    });
    port.onDisconnect.addListener(function(){
      if(typeof(tab)!="undefined"){
        delete tab.frameports[port.frameid];
      }
    });
  }
  if(typeof(tab.topport)!="undefined"&&port.sender.tab.id!="popup"){
    chrome.storage.local.get("forcepopup",function(settings){
      chrome.action.setPopup({
        "tabId":port.sender.tab.id,
        "popup":settings.forcepopup?"popup.html":""
      });
    });
  }
});
chrome.action.onClicked.addListener(function(tab){
  if(typeof(tabs[tab.id])!="undefined"&&typeof(tabs[tab.id]).topport!="undefined"){
    tabs[tab.id].topport.postMessage({
      "type":"browseraction"
    });
  }
});
chrome.tabs.onUpdated.addListener(function(tabId){
  if(typeof(tabs[tabId])!="undefined"&&typeof(tabs[tabId].topport)!="undefined"){
    chrome.storage.local.get("forcepopup",function(settings){
      chrome.action.setPopup({
        "tabId":tabId,
        "popup":settings.forcepopup?"popup.html":""
      });
    });
  }
});
var removepopups=function(){
  chrome.storage.local.get("forcepopup",function(settings){
    for(i in tabs){
      if(typeof(tabs[i].topport)!="undefined"&&i!="popup"){
        chrome.action.setPopup({
          "tabId":parseInt(i,10),
          "popup":settings.forcepopup?"popup.html":""
        });
      }
    }
  });
  setTimeout(removepopups,2500);
};
setTimeout(removepopups,2500);
chrome.runtime.onInstalled.addListener(function(){
  chrome.contextMenus.create({
    "id":"addtosearchbar",
    "title":"添加到 SearchBar...",
    "contexts":["editable"],
    "documentUrlPatterns":["http://*/*","https://*/*"]
  });
});
chrome.contextMenus.onClicked.addListener(function(info,tab){
  if(typeof(tabs[tab.id])!="undefined"&&typeof(tabs[tab.id]).topport!="undefined"){
    tabs[tab.id].topport.postMessage({
      "type":"contextmenu"
    });
  }
});
chrome.tabs.query({"status":"complete"},function(alltabs){
  for(var i=0;i<alltabs.length;i++){
    chrome.scripting.executeScript({
      "target":{"tabId":alltabs[i].id,"allFrames": true},
      "files":["content.js"],
    },function(results){
      if(chrome.runtime.lastError){}
    });
  }
});