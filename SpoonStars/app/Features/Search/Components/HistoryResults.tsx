import RFC, { FC, ReactElement, useState } from 'react'
import { Text } from 'react-native-paper';
import { selectSearchHistory, clearHistory, selectSearchStatus, selectSearchHistoryStatus } from '../SearchSlice';
import { useAppSelector, useAppDispatch } from './../../../Redux/Hooks';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from './../../../App';
import { FlatList } from 'react-native';

interface HistoryResultsProps {
    
}



const HistoryResults: FC<HistoryResultsProps> = () => {
    const searchHistory = useAppSelector(selectSearchHistory);
    const searchStatus = useAppSelector(selectSearchStatus);
    const searchHistoryStatus = useAppSelector(selectSearchHistoryStatus);

    const dispatch = useAppDispatch();
    const { colors: { primary }} = useAppTheme();    
    
    const renderResultItem = ({item}: { item: string, index?:number }): ReactElement => {
        return(
            <View style={styles.resultContainer}>
                <MaterialCommunityIcons
                    name='history'
                    size={20}
                    style={styles.historyIcon}
                />
                <Text style={styles.historyText}>{item}</Text>
            </View>
        )
    }
    
    const listHeader = () => {
        return(
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Recent</Text>
                <Text style={{color: primary}} onPress={() => dispatch(clearHistory())}>Clear</Text>
            </View>
        );
    }
    
    return (
        <>
        { (searchHistoryStatus === 'succeeded') &&
            <FlatList
                ListHeaderComponent={searchHistory.length > 0 ? listHeader : null}
                data={searchHistory}
                keyExtractor={(item: string):string => item}
                renderItem={renderResultItem}
            />
        }
        </>
    );
}

const styles = StyleSheet.create({
    resultContainer: {
        flexDirection: 'row',
    },
    historyText:{
        fontStyle: 'italic',
        marginTop: 10
    },
    historyIcon: {
        marginEnd: 30,
        top: 8
    },
    headerContainer: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
        
    },
    clearHistory: {
        
    },
    headerTitle: {
        
    }
});

export default HistoryResults
