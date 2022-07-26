// 수정기능, 완료기능 추가해보기.

import {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {Fontisto} from '@expo/vector-icons';
// TouchableOpacity는 누르는 이벤트를 listen할 준비가 된 view라고 할 수 있다. (다른 종류들도 있음.)
import { 
  StyleSheet,
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { theme } from './color';
import { AsyncStorage } from 'react-native';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [date, setDate] = useState("");

  useEffect(() => {
    loadToDos();
  }, [])
  const dateToStr = (date) => {
    let week = new Array('일', '월', '화', '수', '목', '금', '토');
    const localTime = date.toLocaleString();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let dayName = week[date.getDay()];

    return year + '년 ' + month + '월 ' + day+'일 ' + dayName + '요일';
  }
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  // onChangeText가 실행되면 text를 받아서 text애 반영해준다.
  const onChangeText = payload => setText(payload);
  const saveToDos = async (toSave) => {
    // 현재 있는 toDos를 string으로 바꿔주고, await AsyncStorage.setItem을 해줄것이다.
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }

  const loadToDos = async() => {
    try{
      // 휴대폰 디스크에 있던 string을 받아서 JS object로 바꿔주고
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s)); // 바뀐 객체를 state에 전달해준다.
    }catch(err){
      alert(err);
    }
  }

  const addToDo = async () => {
    // text에 아무 글자도 입력하지 않으면(text가 없으면) 그냥 되돌아감.
    if(text === ""){
      return;
    }
    // 기존 toDos에 담겨 있던 content와 state에 새롭게 추가된 요소들을 결합해서 만들어주기.
    // key 값으로 date를 밀리초로 계산한 값으로 해주기.
    const newToDos = {...toDos, [Date.now()]: {text, working}};
    // ToDo에 무언가 추가하면 호출
    await setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
    // alert(text);
  };

  // 쓰레기통을 클릭하면, 삭제할 것인지 물어보고,
  const deleteTodo = async (id) => {
    // 리액트 네이티브에서 지원하는 Alert API 사용.
    Alert.alert(
      "Delete ToDo?", 
      "정말로 삭제하시겠습니까?", [
        // Cancel을 누르면 그냥 돌아가고
        {text: "Cancel"},
        {
          // I'm sure을 누르면
          text: "I'm sure", 
          style: "destructive",
          // 여기 함수 실행.
          onPress: () => {
            const newToDos = {...toDos}; // newTodo에 todos 배열을 다 담아주고,
            delete newToDos[id]; // newTodos에서 클릭한 리스트를 삭제한다.
            saveToDos(newToDos); // 삭제한 리스트가 적용된 데이터들을 인자로 담아서 saveTodos()로 보내주기.
            setToDos(newToDos); // toDos에도 변경된 배열 적용시켜주기.
        }}
      ]);
    return;
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto"/>
      <View style={styles.header}>
        {/* TouchableOpacity가 적용된 부분은 막약 누르고 있을 때 요소를 약간 투명해지게 만들어준다. */}
        {/* onPress는 손가락으로 화면을 눌렀다 뗄 때 */}
        <TouchableOpacity onPress={work}>
          {/* text의 색이 working이 true이면 횐색. 아니면 다른 파일에서 가져온 회식으로 변경 */}
          <Text style={{...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: working ? theme.grey : "white"}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
      // onSubmitEditing은 사용자가 done 버튼을 눌렀을 때 실행되는 함수.
        onSubmitEditing={addToDo}
        // onChangeText는 text가 바뀔 때 실행되는 함수.
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        // working이 true일 때(work가 클릭되면), false일 때(travel이 클릭 됐을 때) 보여지는 text가 다름.
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}/>
        <ScrollView>
          {
            // Object.keys()로 key값만 배열에 반환. 각각의 키마다
            Object.keys(toDos).map((key) => 
            // toDos 오브젝트의 key 값에 접근해서 toDo의 working 값이 state의 working 값과 동일한지 확인.
            // 즉, 만약 working이 true이고, state의 working도 true라면 toDos를 보게된다. (모드에 따른 toDos를 볼 수 있음.)
            toDos[key].working === working ? (
              <View style={styles.toDoback}>
                <View style={styles.toDo} key={key}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  {/* 쓰레기통 부분. 클릭하면 deleteTodo 함수에 클릭한 리스트의 key 값을 인자로 보내면서 실행. */}
                  <TouchableOpacity onPress={() => deleteTodo(key)}>
                    <Fontisto style={styles.trash} name="trash" size={18} color={"grey"}></Fontisto>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.toDoDate}>날짜 : {Date.now()}</Text>
                </View>
              </View>) : null)
          }
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    // 컨테이너 가로 방향으로 padding 20px
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600"
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    marginTop: 20,
    fontSize: 18,
  },
  toDoback: {
    backgroundColor: "#333",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: '#fff',
    paddingTop: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  trash: {
    paddingTop: 20,
  },
  toDoDate: {
    color: '#d3d3d3',
    paddingVertical: 10,
  }
});
