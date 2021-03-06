import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import ArchiveExplorer from '../ArchiveExplorer';
import { TABLE_COLUMNS, VIEWS, ROOT_FOLDER } from '../constants';

const sandbox = sinon.sandbox.create();
let data;
let filename;

const getComponent = props => shallow(<ArchiveExplorer {...props} />); // eslint-disable-line

describe('lib/viewers/archive/ArchiveExplorer', () => {
    beforeEach(() => {
        filename = 'test.zip';
        data = [
            {
                type: 'folder',
                absolute_path: 'test/',
                name: 'test',
                modified_at: '19-Dec-02 16:43',
                size: 0,
                item_collection: ['test/csv-level-1.csv', 'test/pdf-level-1.pdf', 'test/subfolder/'],
            },
            {
                type: 'file',
                absolute_path: 'test/csv-level-1.csv',
                name: 'csv-level-1.csv',
                modified_at: '19-Nov-04 16:11',
                size: 133,
                item_collection: null,
            },
            {
                type: 'folder',
                absolute_path: 'test/subfolder/',
                name: 'subfolder',
                modified_at: '19-Dec-02 16:43',
                size: 0,
                item_collection: ['test/subfolder/test-level-2.jpg'],
            },
            {
                type: 'file',
                absolute_path: 'test/subfolder/test-level-2.jpg',
                name: 'test-level-1.jpg',
                modified_at: '19-Nov-08 15:08',
                size: 57379,
                item_collection: null,
            },
            {
                type: 'file',
                absolute_path: 'level-0.txt',
                name: 'level-0.txt',
                modified_at: '19-Nov-04 16:11',
                size: 1,
                item_collection: null,
            },
            {
                type: 'file',
                absolute_path: 'test/pdf-level-1.pdf',
                name: 'pdf-level-1.pdf',
                modified_at: '19-Nov-04 16:11',
                size: 233,
                item_collection: null,
            },
        ];
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });

    describe('render()', () => {
        it('should render correct components', () => {
            const component = getComponent({ filename, itemCollection: data });

            expect(component.find('.bp-ArchiveExplorer').length).to.equal(1);
            expect(component.find('SearchBar').length).to.equal(1);
            expect(component.find('Breadcrumbs').length).to.equal(1);
            expect(component.find('Internationalize').length).to.equal(1);
        });
    });

    describe('handleItemClick()', () => {
        it('should set state when handleItemClick() is called', () => {
            const component = getComponent({ filename, itemCollection: data });

            component.instance().handleItemClick({ fullPath: 'test/subfolder/' });

            expect(component.state().fullPath).to.equal('test/subfolder/');
            expect(component.state().view).to.equal(VIEWS.VIEW_FOLDER);
            expect(component.state().searchQuery).to.equal('');
        });
    });

    describe('handleBreadcrumbClick()', () => {
        it('should set state when handleBreadcrumbClick() is called', () => {
            const component = getComponent({ filename, itemCollection: data });

            component.instance().handleBreadcrumbClick('test/subfolder/');

            expect(component.state().fullPath).to.equal('test/subfolder/');
        });
    });

    describe('getRowData()', () => {
        it('should return correct row data', () => {
            const component = getComponent({ filename, itemCollection: data });

            const rowData = component.instance().getRowData(data)({ index: 0 });

            const { KEY_NAME, KEY_MODIFIED_AT, KEY_SIZE } = TABLE_COLUMNS;
            const { absolute_path: fullPath, modified_at: modifiedAt, name, size, type, ...rest } = data[0];

            expect(rowData).to.eql({
                [KEY_NAME]: {
                    fullPath,
                    isExternal: false,
                    name,
                    type,
                    dataAttributes: {
                        'data-resin-target': type,
                    },
                },
                [KEY_MODIFIED_AT]: modifiedAt,
                [KEY_SIZE]: type === 'folder' ? null : size,
                ...rest,
            });
        });
    });

    describe('getItemList()', () => {
        it('should return correct item list', () => {
            const component = getComponent({ filename, itemCollection: data });

            let itemList = component.instance().getItemList(data, ROOT_FOLDER);

            expect(itemList).to.eql([data[0], data[4]]);

            itemList = component.instance().getItemList(data, 'test/');

            expect(itemList).to.eql([data[1], data[2], data[5]]);
        });
    });

    describe('handleSearch()', () => {
        it('should set correct state when search query longer than 1 letter', () => {
            const component = getComponent({ filename, itemCollection: data });

            component.instance().handleSearch('test');
            expect(component.state().searchQuery).to.equal('test');
            expect(component.state().view).to.equal(VIEWS.VIEW_SEARCH);

            component.instance().handleSearch('');
            expect(component.state().searchQuery).to.equal('');
            expect(component.state().view).to.equal(VIEWS.VIEW_FOLDER);

            component.instance().handleSearch(' ');
            expect(component.state().searchQuery).to.equal(' ');
            expect(component.state().view).to.equal(VIEWS.VIEW_FOLDER);

            component.instance().handleSearch('a');
            expect(component.state().searchQuery).to.equal('a');
            expect(component.state().view).to.equal(VIEWS.VIEW_FOLDER);
        });
    });

    describe('getSearchResult()', () => {
        it('should return correct item list', () => {
            const component = getComponent({ filename, itemCollection: data });

            const itemList = component.instance().getSearchResult(data, 'level-1');
            const fuzzyList = component.instance().getSearchResult(data, 'leel1');

            expect(itemList).to.eql([data[1], data[3], data[5]]);
            expect(fuzzyList).to.eql([data[1], data[3], data[5]]);
        });
    });

    describe('handleSort()', () => {
        it('should set the sort direction and type', () => {
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();

            instance.handleSort({ sortBy: 'name', sortDirection: 'DESC' });

            expect(component.state().sortBy).to.equal('name');
            expect(component.state().sortDirection).to.equal('DESC');
        });
    });

    describe('sortItemList()', () => {
        it('should sort itemList by size and be in DESC order', () => {
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();
            const itemList = instance.getItemList(data, 'test/');

            instance.handleSort({ sortBy: 'size', sortDirection: 'DESC' });
            const sortedList = instance.sortItemList(itemList);

            // folders come before files
            expect(sortedList[0]).to.equal(data[2]);
            expect(sortedList[1]).to.equal(data[5]);
        });

        it('should sort itemList by name and be in ASC order', () => {
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();
            const itemList = instance.getItemList(data, 'test/');

            instance.handleSort({ sortBy: 'name', sortDirection: 'ASC' });
            const sortedList = instance.sortItemList(itemList);

            // folders come before files
            expect(sortedList[0]).to.equal(data[2]);
            expect(sortedList[1]).to.equal(data[1]);
        });

        it('should sort itemList by name and be in DESC order', () => {
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();
            const itemList = instance.getItemList(data, 'test/');

            instance.handleSort({ sortBy: 'name', sortDirection: 'DESC' });
            const sortedList = instance.sortItemList(itemList);

            // folders come before files
            expect(sortedList[0]).to.equal(data[2]);
            expect(sortedList[1]).to.equal(data[5]);
        });

        it('should not sort itemList', () => {
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();
            const itemList = instance.getItemList(data, 'test/');

            const sortedList = instance.sortItemList(itemList);

            expect(sortedList).to.eql(itemList);
        });

        it('should sort item list with string values and null', () => {
            data[1].modified_at = null;
            data[2].modified_at = null;

            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();
            const itemList = instance.getItemList(data, 'test/');

            instance.handleSort({ sortBy: 'modified_at' });

            const sortedList = instance.sortItemList(itemList);

            // folders come before files
            expect(sortedList[0]).to.equal(data[2]);
            // item with not-null value comes first
            expect(sortedList[1]).to.equal(data[5]);
        });

        it('should sort items with number values and null', () => {
            const mockData = [
                { size: 1 },
                { size: 1 },
                { size: 130 },
                { size: null },
                { size: 100 },
                { size: undefined },
            ];
            const sortedMockData = [
                { size: null },
                { size: undefined },
                { size: 130 },
                { size: 100 },
                { size: 1 },
                { size: 1 },
            ];
            const component = getComponent({ filename, itemCollection: data });
            const instance = component.instance();

            instance.handleSort({ sortBy: 'size' });

            expect(instance.sortItemList(mockData).toString()).to.equal(sortedMockData.toString());

            instance.handleSort({ sortBy: 'size', sortDirection: 'ASC' });

            expect(instance.sortItemList(mockData).toString()).to.equal(sortedMockData.reverse().toString());
        });
    });
});
