import React, { FC, ReactElement, useEffect, useState } from 'react'
import { StyleSheet, View, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { selectSearchSuggestions, suggestionsPayload, selectSearchText, 
    selectSearchHistoryStatus, selectSearchStatus, selectSearchErrors,
    selectShowListResults, setShowListResults, selectSearchPageInfo } from '../Scripts/SearchSlice';
import { useAppSelector, useAppDispatch } from '../../../Redux/Hooks';
import HistoryResults from './HistoryResults';
import { StackNavigation, Suggestions } from './../../../../types/App_Types';
import { useAppTheme } from './../../../App';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import SearchHelper from '../Scripts/Search';
import useLoading from '../../Shared/Components/Loading';
import useErrorHandler from '../../Shared/Components/ErrorHandler';
import { UIActivityIndicator } from 'react-native-indicators';
import { FlashList } from '@shopify/flash-list';
import { searchApi, useSuggestRecipesQuery } from '../../Api/SearchApi';


interface PreviewResultsProps {}


const PreviewResults: FC<PreviewResultsProps> = () => {
    const searchSuggestions = useAppSelector(selectSearchSuggestions);
    const searchHistoryStatus = useAppSelector(selectSearchHistoryStatus);
    const searchText = useAppSelector(selectSearchText);
    const searchStatus = useAppSelector(selectSearchStatus);
    const searchErrors = useAppSelector(selectSearchErrors);
    const showListResults = useAppSelector(selectShowListResults);
    const searchPageInfo = useAppSelector(selectSearchPageInfo);
    

    const { search } = SearchHelper();
    const { SearchLoader } = useLoading();
    const { showError } = useErrorHandler();

    const { navigate } = useNavigation<StackNavigation>();
    const dispatch = useAppDispatch();

    //RTK
    const [lastRecord, setLastRecord] = useState<string>('');
    const { data, isLoading, error } = useSuggestRecipesQuery({
        query: searchText,
        recordPerPage: 5,
        endCursor: lastRecord
    })
    
    const { colors: { primary }} = useAppTheme();    

    const renderItem = ({item}: { item: suggestionsPayload, index?:number }): ReactElement => {
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => navigate('Details', { id: 'test' })}>
                <View style={styles.searchDetails}>
                    <Avatar.Image source={{ uri: item.node.mainImage }} size={50} style={styles.avatar}/>
                    <Text style={styles.searchText} numberOfLines={1}>{item.node.name}</Text>
                    
                </View>
                <View>
                    <MaterialCommunityIcons name="magnify" size={10} style={styles.searchIcon} />
                </View>
            </TouchableOpacity>
        )
    }

    const footerComponent = () => {
        if (isLoading){ 
            return (searchStatus === 'loading') ? <UIActivityIndicator  size={30} /> : null;
        }
        else {
            return(
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity style={styles.footer} onPress={showAllResults}>
                        <Text style={{color: primary}}>See all Results</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            );
        }
    }

    const showAllResults = () => {
        dispatch(setShowListResults(true));
        search(true, searchText);
    }

    const handleLoadMore = async () => {
        if (!showListResults)
            return;
        if ((searchStatus === 'succeeded' || searchStatus === 'idle') && searchPageInfo.hasNextPage) {
            await search(true, searchText);
        }
    }

    if (isLoading){
        return (SearchLoader());
    }
    
    if (error != undefined){
        return (showError(error as string));
    }

    if (data!.edges.length == 0){
        return (<HistoryResults />);
    }

    return(
    <GestureHandlerRootView>
        <View style={styles.flashListStyle}>
            <FlashList
                data={data!.edges as Suggestions[] }
                keyExtractor={(item: suggestionsPayload):string => item.node.id}
                renderItem={renderItem}
                ListFooterComponent={footerComponent}
                //onEndReached={handleLoadMore}
                estimatedItemSize={200}
                estimatedListSize={{ height: 200, width: Dimensions.get('screen').width }}
            />
        </View>
    </GestureHandlerRootView>);
}

const styles = StyleSheet.create({
    flashListStyle: {
      marginTop: 20,
      flexDirection: 'row',
      marginStart: 10,
      flexGrow: 1
    },
    footer: {
        alignItems: 'center',
        marginTop: 20
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginEnd: 20
    },
    avatar: {
        marginBottom: 20,
        marginEnd: 10
    },
    searchText: {
        top: 20,
        fontSize: 14,
    },
    searchIcon: {
        fontSize: 20,
        color: 'gray',
        top: 20,
    },
    searchDetails: {
        flexDirection: 'row'
    }
});
  
export default PreviewResults;
