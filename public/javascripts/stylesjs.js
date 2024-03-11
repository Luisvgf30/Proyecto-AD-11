

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
    var selectBox = document.getElementById("selectBox");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    var selectBox2 = document.getElementById("planEstudio");
    var selectedValue2 = selectBox2.options[selectBox2.selectedIndex].value;

    if(selectedValue != "Administrador"){
        if(selectedValue2 == "Grado"){
            document.getElementById("asigGrado").style.display="block";
            document.getElementById("asigMaster").style.display="none"
            document.getElementById("asigDoctorado").style.display="none"

        }else if(selectedValue2 == "Master"){
            document.getElementById("asigGrado").style.display="none"
            document.getElementById("asigMaster").style.display="block";
            document.getElementById("asigDoctorado").style.display="none"

        }else if(selectedValue2 == "Doctorado"){
            document.getElementById("asigGrado").style.display="none"
            document.getElementById("asigMaster").style.display="none"
            document.getElementById("asigDoctorado").style.display="block";
        } 
    }else {
        selectBox2.disabled = true;
    }
}

function mostrarMensaje() {
    swal ( "Ok" ,  "Sugerecia Enviada!" ,  "success" )
}

function nonepasswordmensaje() {
    document.getElementById("password").style.display="none";
}
