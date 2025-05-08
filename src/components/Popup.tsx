import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

interface TableAlertProps {
  visible: boolean;
  title: string;
  data: {[key: string]: string | number}[];
  onClose: () => void;
}

const Popup: React.FC<TableAlertProps> = ({visible, title, data, onClose}) => {
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const screenWidth = Dimensions.get('window').width;
  const cellWidth = 145; // Or adjust dynamically
  const tableWidth = cellWidth * keys.length;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {width: Math.min(tableWidth + 40, screenWidth * 0.95)},
          ]}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView horizontal>
            <View>
              {data.map((item, index) => (
                <View style={styles.row} key={`row-${index}`}>
                  {keys.map(key => (
                    <View
                      style={styles.cellWrapper}
                      key={`cell-${key}-${index}`}>
                      <Text style={styles.cell}>{item[key]}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    maxHeight: '90%',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  cellWrapper: {
    width: 145,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cell: {
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#1185C8',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Popup;
