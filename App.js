import React from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, AsyncStorage } from 'react-native';
import Dialog from 'react-native-dialog';
import {NativeRouter, Route, Link} from 'react-router-native';


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
	<NativeRouter>
	  <Link to='/game'>
	    <Text>Play Game</Text>
	  </Link>
	  <Link to='/scores'>
	    <Text>Read Scores</Text>
	  </Link>
          <Route exact path='/game' component={ColoredButtons} />
          <Route exact path='/scores' component={RecordedScores} />
	</NativeRouter>
      </View>
    </SafeAreaView>
    
    );
  }

}

class RecordedScores extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      total: [],
      usernamesandscores: [],
    };
  }

  async componentDidMount(){
    var keys = await AsyncStorage.getAllKeys();
    if(keys.includes('total')){
      var keysandvalues = await AsyncStorage.multiGet(keys);
      var total = [];
      var usernames = [];
      var scores = [];
      keysandvalues.forEach((element) => {
        if(element[0] === 'total'){
          total = element;
        }
	else if(element[0].substr(0, 5) === 'Score'){
          scores.push(element);
        }
	else if(element[0].substr(0, 8) === 'Username'){
          usernames.push(element);
        }
      });
      var usernamesandscores = [];
      for(var i = 0; i < parseInt(total[1]); i++){
	usernamesandscores.push([usernames[i][1], scores[i][1]]);
      }
      usernamesandscores.sort(function(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
      });
      await this.setState({total: total, usernamesandscores: usernamesandscores});
    }
  }

  render(){
    var ranks = [];
    for(var i = 0; i < this.state.total[1]; i++){
      ranks.push(
        <Text>{this.state.usernamesandscores[i][0] + ' ' + this.state.usernamesandscores[i][1]}</Text>
      );
    }

    return(
      <View>
        {ranks}
      </View>
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
      username: '',
      number: '',
      text: '',
      dialogVisible: false,
    };
    this.changeColor = this.changeColor.bind(this);
    //this.onChangeText = this.onChangeText.bind(this);
    this.saveWinnerData = this.saveWinnerData.bind(this);
    this.getWinnerData = this.getWinnerData.bind(this);
    this.clearData = this.clearData.bind(this);
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
	    this.setState({score: score, dialogVisible: true});
          }
        }

      }
      this.setState({score: score, coloreds: coloreds, originalcolors: originalcolors, reservedcolors: reservedcolors});
    }
  }

  onChangeText = (text) => { // Use arrow function for parameters
    this.setState({username: text})
  }

  async saveWinnerData(){

    this.setState({dialogVisible: false});
    var total = await AsyncStorage.getItem('total');
    if(typeof(total) !== 'string'){
      total = 0;
    }
    await AsyncStorage.setItem(
      'Username ' + (parseInt(total) + 1).toString(), this.state.username
    );
    await AsyncStorage.setItem(
      'Score ' + (parseInt(total) + 1).toString(), this.state.score.toString()
    );
    await AsyncStorage.setItem(
      'total', (parseInt(total) + 1).toString()
    );

  }

  async getWinnerData(){
    var total = await AsyncStorage.getItem('total');
    var value = await AsyncStorage.getItem('Username ' + total);
    var value2 = await AsyncStorage.getItem('Score ' + total);

    this.setState({text: value, number: value2});
  }

  async clearData(){
    await AsyncStorage.clear();
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

	 //this.getWinnerData();
	 //this.clearData();

    return(
      <View style={styles.columnofbuttons}>
        {col}
        <View>
	  <Text>
            {this.state.text}
	  </Text>
	  <Text>
            {this.state.number}
	  </Text>
        </View>
	<View>
    <Dialog.Container visible={this.state.dialogVisible}>
      <Dialog.Title>You won!!!</Dialog.Title>
      <Dialog.Description>
        Your score is {this.state.score}. What is your name?
      </Dialog.Description>
      <Dialog.Description>
        Your score is {this.state.username}. What is your name?
      </Dialog.Description>
      <Dialog.Input onChangeText={this.onChangeText} />
      <Dialog.Button label="OK" onPress={this.saveWinnerData} />
    </Dialog.Container>
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

