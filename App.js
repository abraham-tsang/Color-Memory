import React from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, Alert } from 'react-native';


var pairs = 8;
var colors = ['blue', 'green', 'yellow', 'red', 'orange', 'pink', 'black', 'purple'];
var numbers = [];

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
function colorNumbersGetter(){

  for(var i = 0; i < pairs; i++){
    numbers.push(i);
    numbers.push(i);
  }
  numbers = shuffle(numbers);

}
function coloredsGetter(){
  var coloreds = [];
  for(var i = 0; i < pairs; i++){
    coloreds.push(false);
    coloreds.push(false);
  }
  return coloreds;
}
function colorsGetter(){
  var originalcolors = [];
  for(var i = 0; i < pairs; i++){
    originalcolors.push('gray');
    originalcolors.push('gray');
  }
  return originalcolors;
}
function reservedColorsGetter(){
  var reservedcolors = [];
  for(var i = 0; i < numbers.length; i++){
    reservedcolors.push(colors[numbers[i]]);
  }
  return reservedcolors;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      score: 0,
    };
  }
 
  render(){
    return(
    <SafeAreaView style={styles.container}>
      <View>
      </View>
      <View>
        <ColoredButtons />
      </View>
    </SafeAreaView>
    );
  }

}


class ColoredButtons extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      coloreds: [],
      originalcolors: [],
      reservedcolors: [],
      score: 0,
      number: 0,
    };
    this.changeColor = this.changeColor.bind(this);
    this.createThreeButtonAlert = this.createThreeButtonAlert.bind(this);
  }
 
  componentDidMount(){
    colorNumbersGetter();
    var coloreds = coloredsGetter();
    var originalcolors = colorsGetter();
    var reservedcolors = reservedColorsGetter();
    this.setState({numbers: numbers, coloreds: coloreds, originalcolors: originalcolors, reservedcolors: reservedcolors});
  }

  async changeColor(index){

    if(this.state.originalcolors[index] != 'white'){ // Only deal with remaining cards
      var coloreds = this.state.coloreds;
      var originalcolors = this.state.originalcolors;
      var reservedcolors = this.state.reservedcolors;
      var score = this.state.score;
      

      // For changing color after clicking
      var tempcolor = originalcolors[index];
      originalcolors[index] = reservedcolors[index];
      reservedcolors[index] = tempcolor;
      coloreds[index] = !coloreds[index];
     

      // For changing color after evaluating the colors of all buttons

      var iarr = [];
      for(var i = 0; i < originalcolors.length; i++){
        if(!(originalcolors[i] == 'gray' || originalcolors[i] == 'white')){ // Pressed cards are saved for later evaluation
          iarr.push(i);
        }
      }

      if(iarr.length == 2){ // When the first 2 cards are pressed

        this.setState({originalcolors: originalcolors});
        await sleep(1000);

        if(originalcolors[iarr[0]] == originalcolors[iarr[1]] && originalcolors[iarr[0]] != 'gray'){ // If they are the same color, remove them
          score += 5;
          originalcolors[iarr[0]] = 'white';
          originalcolors[iarr[1]] = 'white';
        }

        else{ // Otherwise, make them go gray
          score -= 1;
          tempcolor = originalcolors[iarr[0]];
          originalcolors[iarr[0]] = reservedcolors[iarr[0]];
          reservedcolors[iarr[0]] = tempcolor;
          tempcolor = originalcolors[iarr[1]];
          originalcolors[iarr[1]] = reservedcolors[iarr[1]];
          reservedcolors[iarr[1]] = tempcolor;
        }
       
        iarr = [];

        
        for(var i = 0; i < originalcolors.length; i++){
          if(originalcolors[i] != 'white'){
            break;
          }
	  else if(i == 15 && originalcolors[i] == 'white'){
            Alert.alert(
              "Alert Title",
              "My Alert Msg",
              [
                {
                  text: "Ask me later",
                  onPress: () => console.log("Ask me later pressed")
                },
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                },
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ]
            );
          }
        }

      }
      this.setState({score: score, coloreds: coloreds, originalcolors: originalcolors, reservedcolors: reservedcolors});
    }
  }
 
  render(){
    var rows = [];
    var temp = [];
    var col = [];
    for(var i = 0; i < 4; i++){
      temp = [];
      for(var j = 0; j < 4; j++){
        temp.push(
          <ColoredButton number={numbers[i*4+j]} colored={this.state.coloreds[i*4+j]} color={this.state.originalcolors[i*4+j]} index={i*4+j} onClick={this.changeColor} />
        );
      }
      rows.push(
        temp
      );
    }
    for(var i = 0; i < 4; i++){
      col.push(
        <View style={styles.rowofbuttons}>
          {rows[i]}
        </View>
      );
    }
    return(
      <View style={styles.columnofbuttons}>
        {col}
        <View><Text>
        {this.state.score}</Text>
        </View>
      </View>
     
    );
  }
 
}

class ColoredButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      colored: false,
      number: 0,
    };
  }
 
  render(){
    return(
      <View style={styles.buttonstyle}>
      <Button title={this.props.index.toString()} color={this.props.color} onPress={this.props.onClick.bind(this, this.props.index)} />
      </View>
    );
  }
 
}

const styles = StyleSheet.create({
  container: {
    flex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  columnofbuttons: {
    flexDirection: 'column',
  },
  rowofbuttons: {
    flexDirection: 'row',
  },
  buttonstyle: {
    height: 40,
    width: 40,
  },
});

export default App;

