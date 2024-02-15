function changeFunc() {
    var selectBox = document.getElementById("selectBox");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    if(selectedValue == "Administrador"){
        document.getElementById("asig").style.display="none";

    }else{
        document.getElementById("asig").style.display="block";

    }
   }

   