document.getElementById("asigGrado").style.display="none";
document.getElementById("asigMaster").style.display="none"
document.getElementById("asigDoctorado").style.display="none"

function changeFunc() {
    var selectBox = document.getElementById("selectBox");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    if(selectedValue == "Administrador"){
        document.getElementById("asigGrado").style.display="none";
        document.getElementById("asigMaster").style.display="none";
        document.getElementById("asigDoctorado").style.display="none";
        document.getElementById("divplanEstudio").style.display="none";

    }else{
        document.getElementById("divplanEstudio").style.display="block";
    }
}

function changeFunc2() {
    var selectBox = document.getElementById("planEstudio");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    if(selectedValue == "Grado"){
        document.getElementById("asigGrado").style.display="block";
        document.getElementById("asigMaster").style.display="none"
        document.getElementById("asigDoctorado").style.display="none"

    }else if(selectedValue == "Master"){
        document.getElementById("asigGrado").style.display="none"
        document.getElementById("asigMaster").style.display="block";
        document.getElementById("asigDoctorado").style.display="none"

    }else if(selectedValue == "Doctorado"){
        document.getElementById("asigGrado").style.display="none"
        document.getElementById("asigMaster").style.display="none"
        document.getElementById("asigDoctorado").style.display="block";
    }
}
