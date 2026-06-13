package com.Genie.Train.Repo;

import com.Genie.Train.entity.Train;
import com.Genie.Train.entity.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {

List<TrainSchedule> findBySource_StationCodeAndDestination_StationCode(String stationCode, String destinationCode);

List<TrainSchedule> findBySource_StationNameAndDestination_StationName(String stationName, String destinationName);

}
